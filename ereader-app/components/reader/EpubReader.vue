<template>
  <div class="epub-reader">
    <!-- Header -->
    <header class="reader-header glass">
      <div class="header-container">
        <div class="book-info">
          <h1 v-if="metadata.title" class="book-title">{{ metadata.title }}</h1>
          <p v-if="metadata.author" class="book-author">
            {{ metadata.author }}
          </p>
        </div>

        <div class="reader-controls">
          <button
            @click="$emit('back-to-library')"
            class="control-btn"
            title="Back to Library"
          >
            <Icon name="home" :size="20" />
            <span class="control-text">Library</span>
          </button>

          <div class="control-separator"></div>

          <button
            @click="toggleParagraphNumbers"
            class="control-btn"
            :class="{ active: showParagraphNumbers }"
            title="Toggle Paragraph Numbers"
          >
            <Icon name="hash" :size="20" />
            <span class="control-text">Paragraphs</span>
          </button>

          <button
            @click="$emit('showToc')"
            class="control-btn"
            title="Table of Contents"
          >
            <Icon name="list" :size="20" />
            <span class="control-text">Contents</span>
          </button>

          <button
            @click="showNotebook = true"
            class="control-btn"
            title="Open Notebook"
          >
            <Icon name="edit" :size="20" />
            <span class="control-text">Notes</span>
          </button>

          <button
            @click="showBookmarks = true"
            class="control-btn"
            title="View Bookmarks"
            :class="{ 'has-bookmarks': bookmarkCount > 0 }"
          >
            <Icon name="bookmark-fill" :size="20" />
            <span class="control-text">Bookmarks</span>
            <span v-if="bookmarkCount > 0" class="bookmark-badge">{{ bookmarkCount }}</span>
          </button>

          <button
            @click="showAIChat = true"
            class="control-btn ai-chat-btn"
            title="AI Assistant"
          >
            <Icon name="message-circle" :size="20" />
            <span class="control-text">AI Chat</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Chapter Progress -->
    <div class="chapter-progress">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <div class="progress-info">
        <span class="chapter-info">
          Chapter {{ currentChapterIndex + 1 }} of {{ totalChapters }}
        </span>
        <span class="reading-time" v-if="estimatedReadingTime">
          ~{{ estimatedReadingTime }} min left
        </span>
      </div>
    </div>

    <!-- Content Container -->
    <div class="content-container">
      <!-- Chapter Navigation -->
      <nav class="chapter-nav nav-prev">
        <button
          @click="previousChapter"
          :disabled="!hasPreviousChapter || isLoading"
          class="nav-btn hover-lift"
          :class="{ disabled: !hasPreviousChapter || isLoading }"
        >
          <Icon name="chevron-left" :size="24" />
        </button>
      </nav>

      <!-- Chapter Content -->
      <main ref="contentWrapper" class="chapter-content-wrapper">
        <article
          class="chapter-content"
          @mouseup="handleSelection"
          @touchend="handleSelection"
        >
          <!-- Chapter Title -->
          <h2 v-if="currentChapter?.title" class="chapter-title">
            {{ currentChapter.title }}
          </h2>

          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading chapter...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <Icon name="alert-circle" :size="48" />
            <h3>Error Loading Chapter</h3>
            <p>{{ error }}</p>
            <button @click="loadChapter(currentChapterIndex)" class="btn-retry">
              Try Again
            </button>
          </div>

          <!-- Chapter Content -->
          <div
            v-else-if="processedChapterContent"
            class="chapter-html ereader-content"
            v-html="processedChapterContent"
            @contextmenu="handleContextMenu"
          ></div>

          <!-- Empty Chapter -->
          <div v-else class="empty-state">
            <Icon name="book-open" :size="48" />
            <p>No content available for this chapter</p>
          </div>
        </article>
      </main>

      <!-- Chapter Navigation -->
      <nav class="chapter-nav nav-next">
        <button
          @click="nextChapter"
          :disabled="!hasNextChapter || isLoading"
          class="nav-btn hover-lift"
          :class="{ disabled: !hasNextChapter || isLoading }"
        >
          <Icon name="chevron-right" :size="24" />
        </button>
      </nav>
    </div>

    <!-- Chapter Styles -->
    <component :is="'style'" v-if="currentChapter?.content?.styles">
      {{ currentChapter.content.styles }}
    </component>

    <!-- Override Styles - Must come after EPUB styles -->
    <component :is="'style'">
      .epub-reader .chapter-content .ereader-content p {
        margin-bottom: 2.5rem !important;
        margin-top: 0 !important;
        padding-bottom: 1.5rem !important;
        border-bottom: 1px solid #e0e0e0 !important;
      }
    </component>

    <!-- Notebook Sidebar -->
    <NotebookSidebar
      :book-id="bookId"
      :is-open="showNotebook"
      @close="showNotebook = false"
    />

    <!-- Bookmarks List -->
    <BookmarksList
      :book-id="bookId"
      :is-open="showBookmarks"
      @close="showBookmarks = false"
      @navigate-to-bookmark="navigateToBookmark"
    />

    <!-- AI Chat -->
    <AIChat
      :book-id="bookId"
      :is-open="showAIChat"
      :book-context="aiBookContext"
      @close="showAIChat = false"
    />

    <!-- Note Add Modal -->
    <NoteAddModal
      :show="showNoteModal"
      :source-text="selectedText"
      :chapter-title="currentChapter?.title"
      :paragraph-number="selectedParagraphNumber"
      @save="addNoteToNotebook"
      @cancel="cancelNoteAdd"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useEpubReader } from "~/composables/useEpubReader";
import { useNotebook } from "~/composables/useNotebook";
import { useLibrary } from "~/composables/useLibrary";
import { useBookmarks } from "~/composables/useBookmarks";
import Icon from "~/components/ui/Icon.vue";
import NotebookSidebar from "~/components/NotebookSidebar.vue";
import NoteAddModal from "~/components/notes/NoteAddModal.vue";
import BookmarkIcon from "~/components/reader/BookmarkIcon.vue";
import BookmarksList from "~/components/reader/BookmarksList.vue";
import AIChat from "~/components/reader/AIChat.vue";

// Props
defineProps({
  // Add any props if needed
});

// Emits
defineEmits(["showToc", "back-to-library"]);

// Use the EPUB reader composable
const {
  isLoading,
  error,
  metadata,
  currentChapter,
  currentChapterIndex,
  totalChapters,
  showParagraphNumbers,
  hasNextChapter,
  hasPreviousChapter,
  processedChapterContent,
  nextChapter,
  previousChapter,
  toggleParagraphNumbers,
  goToChapter,
  parser,
} = useEpubReader();

// Notebook logic
const showNotebook = ref(false);
const showNoteModal = ref(false);
const selectedText = ref("");
const selectedParagraphNumber = ref(null);
const { addToNotebook } = useNotebook();

// Bookmark logic
const {
  setCurrentBook,
  toggleBookmark,
  isLocationBookmarked,
  currentBookBookmarks,
  getChapterBookmarks,
  bookmarkCount
} = useBookmarks();
const hoveredParagraph = ref(null);
const bookmarkElements = ref(new Map());
const showBookmarks = ref(false);

// AI Chat state
const showAIChat = ref(false);

// Library for progress tracking
const { updateBookProgress, getBook } = useLibrary();

const route = useRoute();
const bookId = computed(
  () =>
    route.params.id ||
    metadata.value?.identifier ||
    metadata.value?.title ||
    "unknown-book"
);

// Scroll tracking
let scrollTimeout = null;
const lastScrollPosition = ref(0);
const contentWrapper = ref(null);
const hasRestoredScroll = ref(false);

const saveScrollPosition = () => {
  if (
    bookId.value &&
    bookId.value !== "unknown-book" &&
    lastScrollPosition.value >= 0
  ) {
    console.log(
      "Saving scroll position:",
      lastScrollPosition.value,
      "for chapter:",
      currentChapterIndex.value
    );
    updateBookProgress(
      bookId.value,
      currentChapterIndex.value,
      lastScrollPosition.value
    );
  }
};

const trackScrollPosition = () => {
  if (contentWrapper.value) {
    lastScrollPosition.value = contentWrapper.value.scrollTop;

    // Debounce saving to avoid too many updates
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(saveScrollPosition, 1000); // Save after 1 second of no scrolling
  }
};

// Computed properties
const progressPercentage = computed(() => {
  if (totalChapters.value === 0) return 0;
  return ((currentChapterIndex.value + 1) / totalChapters.value) * 100;
});

const estimatedReadingTime = computed(() => {
  // Rough estimation: 250 words per minute
  if (!processedChapterContent.value) return 0;
  const text = processedChapterContent.value.replace(/<[^>]*>/g, "");
  const wordCount = text.split(/\s+/).length;
  const remainingChapters = totalChapters.value - currentChapterIndex.value - 1;
  const avgWordsPerChapter = wordCount; // Simplified for now
  const totalRemainingWords = avgWordsPerChapter * remainingChapters;
  return Math.ceil(totalRemainingWords / 250);
});

// AI Book Context
const aiBookContext = computed(() => {
  const chapterText = processedChapterContent.value?.replace(/<[^>]*>/g, '') || '';
  const excerpt = chapterText.substring(0, 2000) + (chapterText.length > 2000 ? '...' : '');
  
  return {
    title: metadata.value?.title || 'Unknown Book',
    author: metadata.value?.author || 'Unknown Author',
    chapterIndex: currentChapterIndex.value,
    chapterTitle: currentChapter.value?.title || `Chapter ${currentChapterIndex.value + 1}`,
    currentChapter: currentChapter.value?.title || `Chapter ${currentChapterIndex.value + 1}`,
    totalChapters: totalChapters.value,
    excerpt: excerpt,
    parser: parser.value // Include parser for full book extraction
  };
});

function handleSelection() {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) return;
  const text = sel.toString().trim();
  if (!text) return;

  // find paragraph element
  let node = sel.anchorNode;
  if (node && node.nodeType === 3) node = node.parentElement; // text node -> parent
  const para = node?.closest("p");
  if (!para) return;
  const paraNumAttr = para.getAttribute("data-paragraph-number");
  const paraNum = paraNumAttr ? parseInt(paraNumAttr) : null;

  // Store selection data and show modal
  selectedText.value = text;
  selectedParagraphNumber.value = paraNum;
  showNoteModal.value = true;
}

function addNoteToNotebook(note) {
  const citation = `Chapter: ${currentChapter.value?.title || "Unknown"}${
    selectedParagraphNumber.value
      ? `, Paragraph ${selectedParagraphNumber.value}`
      : ""
  }`;

  const fullNote = `${note.content}\n\n---\n📖 ${citation}\n💭 "${selectedText.value}"`;

  addToNotebook(bookId.value, fullNote);
  showNoteModal.value = false;
  clearSelection();
}

function cancelNoteAdd() {
  showNoteModal.value = false;
  clearSelection();
}

function clearSelection() {
  selectedText.value = "";
  selectedParagraphNumber.value = null;
  window.getSelection()?.removeAllRanges();
}

// Bookmark methods
function handleBookmarkClick(paragraphNumber) {
  const paragraph = document.querySelector(`p[data-paragraph-number="${paragraphNumber}"]`);
  const paragraphText = paragraph?.textContent?.trim().substring(0, 200) || '';
  
  toggleBookmark({
    chapterIndex: currentChapterIndex.value,
    chapterTitle: currentChapter.value?.title || 'Chapter ' + (currentChapterIndex.value + 1),
    paragraphNumber: paragraphNumber,
    paragraphText: paragraphText
  });
}

function handleContextMenu(event) {
  event.preventDefault();
  const paragraph = event.target.closest('p[data-paragraph-number]');
  if (paragraph) {
    const paragraphNumber = parseInt(paragraph.getAttribute('data-paragraph-number'));
    handleBookmarkClick(paragraphNumber);
  }
}

// Check if paragraph is bookmarked (for dynamic rendering)
function isParagraphBookmarked(paragraphNumber) {
  return isLocationBookmarked(currentChapterIndex.value, paragraphNumber);
}

// Navigate to a bookmark
async function navigateToBookmark(bookmark) {
  // Navigate to the chapter if different
  if (bookmark.chapterIndex !== currentChapterIndex.value) {
    await goToChapter(bookmark.chapterIndex);
  }
  
  // Wait for content to load
  await nextTick();
  setTimeout(() => {
    // Find and scroll to the paragraph
    const paragraph = document.querySelector(`p[data-paragraph-number="${bookmark.paragraphNumber}"]`);
    if (paragraph) {
      paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight briefly
      paragraph.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
      setTimeout(() => {
        paragraph.style.backgroundColor = '';
      }, 2000);
    }
  }, 300);
}

// Save before page unload (refresh/close)
const handleBeforeUnload = () => {
  clearTimeout(scrollTimeout);
  saveScrollPosition();
};

// Restore scroll position when content is ready
const restoreScrollPosition = async () => {
  if (hasRestoredScroll.value) return;

  const book = getBook(bookId.value);
  const savedPosition = book?.readingProgress?.scrollPosition || 0;

  if (
    savedPosition > 0 &&
    book?.readingProgress?.currentChapter === currentChapterIndex.value
  ) {
    console.log(
      "Attempting to restore scroll position:",
      savedPosition,
      "for chapter:",
      currentChapterIndex.value
    );

    // Wait for DOM to update
    await nextTick();

    // Give more time for content to render
    setTimeout(() => {
      const wrapper =
        contentWrapper.value ||
        document.querySelector(".chapter-content-wrapper");
      if (wrapper) {
        const scrollHeight = wrapper.scrollHeight;
        const clientHeight = wrapper.clientHeight;

        console.log("Scroll dimensions:", {
          scrollHeight,
          clientHeight,
          savedPosition,
        });

        // Only restore if content is scrollable
        if (scrollHeight > clientHeight) {
          const maxScroll = scrollHeight - clientHeight;
          const targetScroll = Math.min(savedPosition, maxScroll);
          console.log("Restoring scroll to:", targetScroll);
          wrapper.scrollTop = targetScroll;
          lastScrollPosition.value = targetScroll;
          hasRestoredScroll.value = true;
        } else {
          console.log("Content not yet scrollable, will retry");
        }
      } else {
        console.log("Wrapper not found");
      }
    }, 300); // Give content time to fully render
  } else {
    console.log("No scroll position to restore or wrong chapter");
  }
};

// Lifecycle hooks
onMounted(() => {
  // Initialize bookmarks for current book
  if (bookId.value && bookId.value !== "unknown-book") {
    setCurrentBook(bookId.value);
  }

  // Add beforeunload listener for page refresh
  window.addEventListener("beforeunload", handleBeforeUnload);

  // Setup scroll tracking after DOM is ready
  nextTick(() => {
    if (contentWrapper.value) {
      contentWrapper.value.addEventListener("scroll", trackScrollPosition);
    }
  });

  // Try to restore scroll position if content is already loaded
  setTimeout(() => {
    if (processedChapterContent.value && !hasRestoredScroll.value) {
      restoreScrollPosition();
    }
  }, 500);
});

onUnmounted(() => {
  // Remove listeners
  if (contentWrapper.value) {
    contentWrapper.value.removeEventListener("scroll", trackScrollPosition);
  }
  window.removeEventListener("beforeunload", handleBeforeUnload);

  // Clear timeout and save final position
  clearTimeout(scrollTimeout);
  saveScrollPosition();
});

// Watch for chapter changes to save progress
watch(currentChapterIndex, (newIndex, oldIndex) => {
  if (
    oldIndex !== undefined &&
    bookId.value &&
    bookId.value !== "unknown-book"
  ) {
    // Save progress when changing chapters
    updateBookProgress(bookId.value, newIndex, 0);
  }

  // Reset scroll position for new chapter
  lastScrollPosition.value = 0;
  hasRestoredScroll.value = false;
});

// Watch for bookId changes to update bookmark context
watch(bookId, (newBookId) => {
  if (newBookId && newBookId !== "unknown-book") {
    setCurrentBook(newBookId);
  }
});

// Watch for chapter content changes to restore scroll position and setup bookmarks
watch(
  () => processedChapterContent.value,
  async (newContent) => {
    if (newContent) {
      await restoreScrollPosition();
      // Setup bookmark click handlers and update bookmark states
      await nextTick();
      setupBookmarkHandlers();
    }
  },
  { immediate: true }
);

// Watch for bookmark changes to update paragraph classes
watch(
  () => currentBookBookmarks.value,
  () => {
    updateBookmarkClasses();
  },
  { deep: true }
);

// Setup bookmark handlers
function setupBookmarkHandlers() {
  const paragraphs = document.querySelectorAll('.ereader-content p[data-paragraph-number]');
  
  paragraphs.forEach(p => {
    const paragraphNumber = parseInt(p.getAttribute('data-paragraph-number'));
    
    // Update bookmark class
    if (isParagraphBookmarked(paragraphNumber)) {
      p.classList.add('bookmarked');
    } else {
      p.classList.remove('bookmarked');
    }
    
    // Add click handler to pseudo-element area
    p.addEventListener('click', (e) => {
      // Check if click is on the bookmark icon area (right side)
      const rect = p.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX > rect.width - 60) { // 60px from right edge
        e.preventDefault();
        e.stopPropagation();
        handleBookmarkClick(paragraphNumber);
      }
    });
  });
}

// Update bookmark classes for all paragraphs
function updateBookmarkClasses() {
  const paragraphs = document.querySelectorAll('.ereader-content p[data-paragraph-number]');
  
  paragraphs.forEach(p => {
    const paragraphNumber = parseInt(p.getAttribute('data-paragraph-number'));
    if (isParagraphBookmarked(paragraphNumber)) {
      p.classList.add('bookmarked');
    } else {
      p.classList.remove('bookmarked');
    }
  });
}
</script>

<style scoped>
.epub-reader {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-secondary);
  position: relative;
}

/* Header */
.reader-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--primary-gradient);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-light);
  padding: 1rem 0;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.book-info {
  flex: 1;
  min-width: 0;
}

.book-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0.25rem 0 0 0;
}

.reader-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.625rem 1rem;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all var(--transition-base);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.control-btn.active {
  background: white;
  color: var(--primary-color);
  border-color: white;
}

.control-btn.has-bookmarks {
  position: relative;
}

.control-btn.ai-chat-btn {
  background: var(--secondary-gradient);
  border-color: transparent;
}

.control-btn.ai-chat-btn:hover {
  background: var(--secondary-gradient);
  transform: translateY(-1px) scale(1.05);
}

.bookmark-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid var(--primary-color);
}

.control-text {
  display: inline-block;
}

.control-separator {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 0.5rem;
}

/* Chapter Progress */
.chapter-progress {
  background: white;
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
}

.progress-bar {
  max-width: 1400px;
  margin: 0 auto 0.5rem;
  padding: 0 2rem;
}

.progress-bar {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-gradient);
  transition: width var(--transition-slow);
}

.progress-info {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Content Container */
.content-container {
  flex: 1;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  position: relative;
}

/* Chapter Navigation */
.chapter-nav {
  display: flex;
  align-items: center;
  padding: 2rem;
}

.nav-btn {
  background: white;
  border: 1px solid var(--border-color);
  color: var(--primary-color);
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.nav-btn:hover:not(.disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.nav-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Chapter Content */
.chapter-content-wrapper {
  flex: 1;
  overflow-y: auto;
  background: white;
  box-shadow: var(--shadow-lg);
}

.chapter-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem;
  min-height: 100%;
}

.chapter-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 3rem 0;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
}

/* Chapter HTML Content */
.chapter-html {
  line-height: 1.8;
  font-size: 1.125rem;
  color: var(--text-primary);
  animation: fadeIn 0.3s ease-out;
}

/* Force paragraph spacing with maximum specificity */
.epub-reader .chapter-content .ereader-content p {
  margin-bottom: 2.5rem !important;
  margin-top: 0 !important;
  padding-bottom: 1.5rem !important;
  text-align: justify;
  position: relative;
  border-bottom: 1px solid #e0e0e0 !important;
  transition: background-color var(--transition-fast);
}

/* Override any EPUB inline styles */
.epub-reader .chapter-content .ereader-content p[style] {
  margin-bottom: 2.5rem !important;
  margin-top: 0 !important;
  padding-bottom: 1.5rem !important;
  border-bottom: 1px solid #e0e0e0 !important;
}

/* Handle nested paragraphs */
.epub-reader .chapter-content .ereader-content div p,
.epub-reader .chapter-content .ereader-content blockquote p,
.epub-reader .chapter-content .ereader-content li p {
  margin-bottom: 2.5rem !important;
  margin-top: 0 !important;
  padding-bottom: 1.5rem !important;
  border-bottom: 1px solid #e0e0e0 !important;
}

/* Remove bottom border from last paragraph */
.epub-reader .chapter-content .ereader-content p:last-child {
  border-bottom: none !important;
}

/* Paragraph hover state with bookmark icon */
.epub-reader .chapter-content .ereader-content p[data-paragraph-number] {
  position: relative;
  padding-right: 3rem !important;
}

.epub-reader .chapter-content .ereader-content p[data-paragraph-number]:hover {
  background-color: rgba(99, 102, 241, 0.05);
}

/* Bookmark icon on hover */
.epub-reader .chapter-content .ereader-content p[data-paragraph-number]::after {
  content: '🔖';
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  font-size: 1.25rem;
  opacity: 0;
  transition: opacity var(--transition-fast);
  cursor: pointer;
  user-select: none;
}

.epub-reader .chapter-content .ereader-content p[data-paragraph-number]:hover::after {
  opacity: 0.5;
}

.epub-reader .chapter-content .ereader-content p[data-paragraph-number].bookmarked::after {
  opacity: 1 !important;
  filter: saturate(1.5);
}

.chapter-html h1,
.chapter-html h2,
.chapter-html h3,
.chapter-html h4,
.chapter-html h5,
.chapter-html h6 {
  margin: 2rem 0 1rem 0;
  line-height: 1.3;
  font-weight: 600;
}

.chapter-html img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 2rem auto;
  border-radius: var(--radius-lg);
}

.chapter-html blockquote {
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid var(--primary-color);
  background: var(--bg-tertiary);
  font-style: italic;
  border-radius: var(--radius-md);
}

/* Paragraph Numbers */
.chapter-html .paragraph-number {
  position: absolute;
  left: -3rem;
  top: 0.125rem;
  background: var(--primary-gradient);
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: var(--text-secondary);
}

.error-state svg {
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-state h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.error-state p {
  margin: 0 0 2rem 0;
}

.btn-retry {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-retry:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-secondary);
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Selection Styles */
.chapter-html ::selection {
  background: var(--primary-light);
  color: white;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .chapter-nav {
    padding: 1rem;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
    padding: 0 1rem;
  }

  .book-info {
    margin-bottom: 1rem;
  }

  .reader-controls {
    width: 100%;
    justify-content: space-between;
  }

  .control-text {
    display: none;
  }

  .control-separator {
    display: none;
  }

  .chapter-content {
    padding: 2rem 1rem;
  }

  .chapter-title {
    font-size: 1.5rem;
  }

  .chapter-html {
    font-size: 1rem;
  }

  .chapter-html .paragraph-number {
    position: static;
    display: inline-flex;
    margin-right: 0.5rem;
    vertical-align: middle;
  }
}

@media (max-width: 480px) {
  .book-title {
    font-size: 1.25rem;
  }

  .chapter-nav {
    padding: 0.5rem;
  }

  .nav-btn {
    width: 36px;
    height: 36px;
  }

  .nav-btn svg {
    width: 20px;
    height: 20px;
  }
}
</style>
