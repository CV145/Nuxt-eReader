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
            @click="toggleNotebook"
            class="control-btn"
            :class="{ active: showNotebook }"
            title="Toggle Notes Side-by-Side"
          >
            <Icon name="edit" :size="20" />
            <span class="control-text">Notes</span>
          </button>

          <button
            @click="toggleFocusMode"
            class="control-btn"
            :class="{ active: focusMode }"
            title="Focus Mode"
          >
            <Icon name="eye" :size="20" />
            <span class="control-text">Focus</span>
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
            @click="downloadCurrentChapter"
            class="control-btn ai-chat-btn"
            title="Download Chapter as Text"
          >
            <Icon name="download" :size="20" />
            <span class="control-text">Download</span>
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
    <div class="content-container" :class="{ 'side-by-side': showNotebook }">
      <!-- Reading Area -->
      <div class="reading-area">
        <!-- Chapter Navigation -->
        <nav class="chapter-nav nav-prev" v-if="!focusMode">
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
        <main ref="contentWrapper" class="chapter-content-wrapper" :class="{ 'focus-mode': focusMode }">
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
            v-else-if="processedChapterContent && !focusMode"
            class="chapter-html ereader-content"
            v-html="processedChapterContent"
            @contextmenu="handleContextMenu"
          ></div>
          
          <!-- Focus Mode Content -->
          <div
            v-else-if="focusMode"
            class="chapter-html ereader-content focus-content"
          >
            <div v-if="focusModeContent" v-html="focusModeContent"></div>
            <div v-else class="focus-loading">
              <p>Loading paragraph {{ currentParagraphIndex + 1 }} of {{ totalParagraphs }}...</p>
              <button @click="updateFocusModeContent" class="btn-retry">Retry</button>
            </div>
          </div>

          <!-- Empty Chapter -->
          <div v-else class="empty-state">
            <Icon name="book-open" :size="48" />
            <p>No content available for this chapter</p>
          </div>
        </article>
        </main>

        <!-- Chapter Navigation -->
        <nav class="chapter-nav nav-next" v-if="!focusMode">
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

      <!-- Notes Sidebar -->
      <div v-if="showNotebook" class="notes-container">
        <NotebookSidebar
          :book-id="bookId"
          :is-open="showNotebook"
          :side-by-size="true"
          @close="showNotebook = false"
        />
      </div>
    </div>

    <!-- Focus Mode Controls -->
    <div v-if="focusMode" class="focus-mode-controls">
      <button @click="focusPreviousParagraph" :disabled="currentParagraphIndex <= 0 && !hasPreviousChapter" class="focus-nav-btn">
        <Icon name="chevron-up" :size="20" />
      </button>
      <div class="focus-progress">
        <span>{{ currentParagraphIndex + 1 }} / {{ totalParagraphs }}</span>
        <div class="chapter-indicator">Chapter {{ currentChapterIndex + 1 }} of {{ totalChapters }}</div>
        <div class="focus-progress-bar">
          <div class="focus-progress-fill" :style="{ width: focusProgressPercentage + '%' }"></div>
        </div>
      </div>
      <button @click="focusNextParagraph" :disabled="currentParagraphIndex >= totalParagraphs - 1 && !hasNextChapter" class="focus-nav-btn">
        <Icon name="chevron-down" :size="20" />
      </button>
      <button @click="bookmarkCurrentParagraph" class="focus-action-btn" :class="{ active: isCurrentParagraphBookmarked }" title="Bookmark Current Paragraph">
        <Icon name="bookmark" :size="18" />
      </button>
      <button @click="exitFocusMode" class="focus-exit-btn" data-exit-focus>
        <Icon name="x" :size="20" />
      </button>
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


    <!-- Bookmarks List -->
    <BookmarksList
      :book-id="bookId"
      :is-open="showBookmarks"
      @close="showBookmarks = false"
      @navigate-to-bookmark="navigateToBookmark"
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


// Focus Mode state
const focusMode = ref(false);
const currentParagraphIndex = ref(0);
const totalParagraphs = ref(0);
const focusModeContent = ref('');

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

// Notes toggle
function toggleNotebook() {
  showNotebook.value = !showNotebook.value;
}

// Download current chapter as text file
function downloadCurrentChapter() {
  if (!processedChapterContent.value) {
    alert('No chapter content available to download.');
    return;
  }

  // Extract text from HTML content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = processedChapterContent.value;
  
  // Remove any script or style tags
  const scripts = tempDiv.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());
  
  // Get clean text content
  let textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up excessive whitespace and format nicely
  textContent = textContent
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n\n') // Replace multiple newlines with double newline
    .trim();
  
  // Add chapter header
  const chapterTitle = currentChapter.value?.title || `Chapter ${currentChapterIndex.value + 1}`;
  const bookTitle = metadata.value?.title || 'Unknown Book';
  const author = metadata.value?.author || 'Unknown Author';
  
  const fullContent = `${bookTitle}
${author ? `by ${author}` : ''}

${chapterTitle}
${'='.repeat(chapterTitle.length)}

${textContent}

---
Downloaded from ${bookTitle}
Chapter ${currentChapterIndex.value + 1} of ${totalChapters.value}
Generated on ${new Date().toLocaleDateString()}`;

  // Create and download file
  const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  // Create filename
  const safeTitles = {
    book: (bookTitle).replace(/[^a-z0-9]/gi, '_').toLowerCase(),
    chapter: chapterTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  };
  
  const filename = `${safeTitles.book}-${safeTitles.chapter}-chapter${currentChapterIndex.value + 1}.txt`;
  
  // Create download link and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Clean up URL
  URL.revokeObjectURL(url);
  
  // Show success message
  setTimeout(() => {
    alert(`Chapter downloaded successfully as "${filename}"`);
  }, 100);
}

// Add paragraph to notes
function addToNotes(paragraphNumber, paragraphText) {
  const citation = `Chapter: ${currentChapter.value?.title || "Unknown"}${
    paragraphNumber ? `, Paragraph ${paragraphNumber}` : ""
  }`;

  const note = `${paragraphText}\n\n---\n📖 ${citation}`;
  addToNotebook(bookId.value, note);
  
  if (!showNotebook.value) {
    showNotebook.value = true;
  }
}

// Focus Mode functions
function toggleFocusMode() {
  if (!focusMode.value) {
    enterFocusMode();
  } else {
    exitFocusMode();
  }
}

function enterFocusMode() {
  focusMode.value = true;
  currentParagraphIndex.value = 0;
  
  // Wait for the DOM to update with focus mode, then get content
  nextTick(() => {
    setTimeout(() => {
      updateFocusModeContent();
    }, 100); // Small delay to ensure content is ready
  });
}

function exitFocusMode() {
  focusMode.value = false;
  // Scroll to the paragraph that was being read
  nextTick(() => {
    const paragraphs = document.querySelectorAll('.ereader-content p[data-paragraph-number]');
    if (paragraphs[currentParagraphIndex.value]) {
      paragraphs[currentParagraphIndex.value].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

function updateFocusModeContent() {
  // Wait for DOM to be ready, then look for paragraphs
  nextTick(() => {
    // First try to get paragraphs from the processed content that's already rendered
    const contentDiv = document.querySelector('.chapter-html.ereader-content:not(.focus-content)');
    let paragraphs = [];
    
    if (contentDiv) {
      paragraphs = Array.from(contentDiv.querySelectorAll('p'));
    } else {
      // Fallback: parse from the raw HTML content
      if (processedChapterContent.value) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = processedChapterContent.value;
        paragraphs = Array.from(tempDiv.querySelectorAll('p'));
      }
    }
    
    // Filter out empty paragraphs
    paragraphs = paragraphs.filter(p => p.textContent.trim().length > 0);
    
    totalParagraphs.value = paragraphs.length;
    console.log('Focus mode: Found', totalParagraphs.value, 'paragraphs, current index:', currentParagraphIndex.value);
    
    if (paragraphs[currentParagraphIndex.value]) {
      const paragraph = paragraphs[currentParagraphIndex.value];
      focusModeContent.value = paragraph.outerHTML;
      console.log('Focus mode: Displaying paragraph', currentParagraphIndex.value + 1, 'of', totalParagraphs.value);
    } else {
      console.log('Focus mode: No paragraph found at index', currentParagraphIndex.value);
      // If no paragraph at current index, reset to 0
      if (paragraphs.length > 0) {
        currentParagraphIndex.value = 0;
        focusModeContent.value = paragraphs[0].outerHTML;
      }
    }
  });
}

function focusNextParagraph() {
  if (currentParagraphIndex.value < totalParagraphs.value - 1) {
    currentParagraphIndex.value++;
    updateFocusModeContent();
  } else {
    // At the end of current chapter, advance to next chapter
    if (hasNextChapter.value) {
      nextChapter().then(() => {
        // Reset to first paragraph of new chapter
        currentParagraphIndex.value = 0;
        // Wait for new chapter content to load
        setTimeout(() => {
          updateFocusModeContent();
        }, 300);
      });
    } else {
      // End of book - show completion message
      showChapterCompleteMessage();
    }
  }
}

function focusPreviousParagraph() {
  if (currentParagraphIndex.value > 0) {
    currentParagraphIndex.value--;
    updateFocusModeContent();
  } else {
    // At the beginning of current chapter, go to previous chapter
    if (hasPreviousChapter.value) {
      previousChapter().then(() => {
        // Go to last paragraph of previous chapter
        setTimeout(() => {
          // Update content first to get correct paragraph count
          updateFocusModeContent();
          // Then set to last paragraph
          setTimeout(() => {
            currentParagraphIndex.value = Math.max(0, totalParagraphs.value - 1);
            updateFocusModeContent();
          }, 100);
        }, 300);
      });
    }
  }
}

function showChapterCompleteMessage() {
  // Create a completion overlay
  const overlay = document.createElement('div');
  overlay.className = 'focus-completion-overlay';
  overlay.innerHTML = `
    <div class="completion-card">
      <div class="completion-icon">🎉</div>
      <h2>Book Complete!</h2>
      <p>You've finished reading "${metadata.value?.title || 'this book'}"</p>
      <div class="completion-actions">
        <button onclick="this.closest('.focus-completion-overlay').remove()" class="btn-secondary">
          Stay in Focus Mode
        </button>
        <button onclick="document.querySelector('[data-exit-focus]')?.click()" class="btn-primary">
          Exit Focus Mode
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.remove();
    }
  }, 10000);
}

const focusProgressPercentage = computed(() => {
  if (totalParagraphs.value === 0) return 0;
  return ((currentParagraphIndex.value + 1) / totalParagraphs.value) * 100;
});

// Focus mode bookmark functionality
const isCurrentParagraphBookmarked = computed(() => {
  const paragraphNumber = currentParagraphIndex.value + 1; // Paragraph numbers are 1-based
  return isLocationBookmarked(currentChapterIndex.value, paragraphNumber);
});

function bookmarkCurrentParagraph() {
  const paragraphNumber = currentParagraphIndex.value + 1; // Paragraph numbers are 1-based
  
  // Get paragraph text from focus mode content
  let paragraphText = '';
  if (focusModeContent.value) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = focusModeContent.value;
    paragraphText = tempDiv.textContent?.trim().substring(0, 200) || '';
  }
  
  toggleBookmark({
    chapterIndex: currentChapterIndex.value,
    chapterTitle: currentChapter.value?.title || 'Chapter ' + (currentChapterIndex.value + 1),
    paragraphNumber: paragraphNumber,
    paragraphText: paragraphText
  });
}

// Keyboard navigation for focus mode
function handleFocusModeKeydown(event) {
  if (!focusMode.value) return;
  
  switch (event.key) {
    case ' ':
    case 'ArrowDown':
      event.preventDefault();
      focusNextParagraph();
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusPreviousParagraph();
      break;
    case 'Escape':
      exitFocusMode();
      break;
  }
  
  if (event.shiftKey && event.key === ' ') {
    event.preventDefault();
    focusPreviousParagraph();
  }
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
    
    // Create custom context menu
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();
    
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    
    menu.innerHTML = `
      <div class="menu-item" data-action="bookmark">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        ${isParagraphBookmarked(paragraphNumber) ? 'Remove Bookmark' : 'Add Bookmark'}
      </div>
      <div class="menu-item" data-action="mindmap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Add to Notes
      </div>
      <div class="menu-item" data-action="note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Add Note
      </div>
    `;
    
    document.body.appendChild(menu);
    
    // Handle menu item clicks
    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.menu-item');
      if (item) {
        const action = item.getAttribute('data-action');
        const paragraphText = paragraph.textContent.trim().substring(0, 200);
        
        switch (action) {
          case 'bookmark':
            handleBookmarkClick(paragraphNumber);
            break;
          case 'mindmap':
            addToNotes(paragraphNumber, paragraphText);
            break;
          case 'note':
            selectedText.value = paragraphText;
            selectedParagraphNumber.value = paragraphNumber;
            showNoteModal.value = true;
            break;
        }
        
        menu.remove();
      }
    });
    
    // Remove menu on click outside
    setTimeout(() => {
      document.addEventListener('click', function removeMenu() {
        menu.remove();
        document.removeEventListener('click', removeMenu);
      }, { once: true });
    }, 100);
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
  // Add focus mode keyboard listener
  window.addEventListener('keydown', handleFocusModeKeydown);
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
  window.removeEventListener('keydown', handleFocusModeKeydown);

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
      
      // Update focus mode content if active
      if (focusMode.value) {
        setTimeout(() => {
          updateFocusModeContent();
        }, 200);
      }
    }
  },
  { immediate: true }
);

// Watch for focus mode changes
watch(focusMode, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

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

/* Side-by-side layout */
.content-container.side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.content-container:not(.side-by-side) .reading-area {
  max-width: 1200px;
  margin: 0 auto;
}

.reading-area {
  display: flex;
  align-items: stretch;
  overflow: hidden;
  position: relative;
}

.notes-container {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
}

/* Focus Mode Styles */
.chapter-content-wrapper.focus-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
}

.chapter-content-wrapper.focus-mode .chapter-content {
  max-width: 900px;
  width: 100%;
  padding: 0;
}

.chapter-content-wrapper.focus-mode .chapter-html {
  font-size: 1.375rem;
  line-height: 1.8;
}

.chapter-content-wrapper.focus-mode .focus-content p {
  background: white;
  padding: 4rem 3rem !important;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin: 0 auto !important;
  border: none !important;
  max-width: 800px;
  color: #1f2937 !important;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-weight: 400;
  text-align: justify;
  position: relative;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.chapter-content-wrapper.focus-mode .focus-content p::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
  border-radius: 20px 20px 0 0;
}

.focus-loading {
  background: white;
  padding: 4rem 3rem !important;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin: 0 auto !important;
  max-width: 800px;
  text-align: center;
  color: #6b7280;
}

.focus-loading .btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.focus-mode-controls {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.focus-nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: white;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.focus-nav-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: scale(1.1);
}

.focus-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.focus-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: white;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.focus-action-btn:hover {
  background: var(--bg-tertiary);
  transform: scale(1.1);
}

.focus-action-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.focus-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
}

.focus-progress span {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.chapter-indicator {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.8;
  margin-top: 0.25rem;
}

.focus-progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.focus-progress-fill {
  height: 100%;
  background: var(--primary-gradient);
  transition: width 0.3s ease;
}

.focus-exit-btn {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.focus-exit-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.1);
}

/* Responsive adjustments for side-by-side */
@media (max-width: 1024px) {
  .content-container.side-by-side {
    grid-template-columns: 1fr;
  }
  
  .notes-container {
    position: fixed;
    top: 0;
    right: 0;
    width: 80%;
    height: 100%;
    z-index: 1000;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 768px) {
  .focus-mode-controls {
    bottom: 1rem;
    padding: 0.75rem 1.5rem;
    gap: 0.75rem;
  }
  
  .focus-nav-btn {
    width: 36px;
    height: 36px;
  }
  
  .focus-progress {
    min-width: 150px;
  }
}

/* Context Menu Styles */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 4px;
  z-index: 10000;
  min-width: 180px;
}

.context-menu .menu-item {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 14px;
  color: var(--text-primary);
}

.context-menu .menu-item:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.context-menu .menu-item svg {
  flex-shrink: 0;
}

/* Focus Mode Completion Overlay */
.focus-completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  animation: fadeIn 0.3s ease-out;
}

.completion-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.completion-card h2 {
  color: #1f2937;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.completion-card p {
  color: #6b7280;
  margin: 0 0 2rem 0;
}

.completion-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
