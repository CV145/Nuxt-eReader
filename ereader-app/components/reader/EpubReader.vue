<template>
  <div class="epub-reader">
    <!-- Header -->
    <header class="reader-header glass">
      <div class="header-container">
        <div class="book-info">
          <h1 v-if="metadata.title" class="book-title">{{ metadata.title }}</h1>
          <p v-if="metadata.author" class="book-author">{{ metadata.author }}</p>
        </div>
        
        <div class="reader-controls">
          <button @click="$emit('back-to-library')" class="control-btn" title="Back to Library">
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
          
          <button @click="$emit('showToc')" class="control-btn" title="Table of Contents">
            <Icon name="list" :size="20" />
            <span class="control-text">Contents</span>
          </button>
          
          <button @click="showNotebook = true" class="control-btn" title="Open Notebook">
            <Icon name="edit" :size="20" />
            <span class="control-text">Notes</span>
          </button>
          
          <!-- Debug button -->
          <button @click="testScroll" class="control-btn" title="Test Scroll">
            <Icon name="arrow-down" :size="20" />
            <span class="control-text">Test</span>
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
            class="chapter-html"
            v-html="processedChapterContent"
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
    <component 
      :is="'style'" 
      v-if="currentChapter?.content?.styles"
    >
      {{ currentChapter.content.styles }}
    </component>

    <!-- Notebook Sidebar -->
    <NotebookSidebar
      :book-id="bookId"
      :is-open="showNotebook"
      @close="showNotebook = false"
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useEpubReader } from '~/composables/useEpubReader'
import { useNotebook } from '~/composables/useNotebook'
import { useLibrary } from '~/composables/useLibrary'
import Icon from '~/components/ui/Icon.vue'
import NotebookSidebar from '~/components/NotebookSidebar.vue'
import NoteAddModal from '~/components/notes/NoteAddModal.vue'

// Props
defineProps({
  // Add any props if needed
})

// Emits
defineEmits(['showToc', 'back-to-library'])

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
  toggleParagraphNumbers
} = useEpubReader()

// Notebook logic
const showNotebook = ref(false)
const showNoteModal = ref(false)
const selectedText = ref('')
const selectedParagraphNumber = ref(null)
const { addToNotebook } = useNotebook()

// Library for progress tracking
const { updateBookProgress, getBook } = useLibrary()

const route = useRoute()
const bookId = computed(() => route.params.id || metadata.value?.identifier || metadata.value?.title || 'unknown-book')

// Scroll tracking
let scrollTimeout = null
const lastScrollPosition = ref(0)
const contentWrapper = ref(null)

const saveScrollPosition = () => {
  if (bookId.value && bookId.value !== 'unknown-book' && lastScrollPosition.value >= 0) {
    console.log('Saving scroll position:', lastScrollPosition.value)
    updateBookProgress(bookId.value, currentChapterIndex.value, lastScrollPosition.value)
  }
}

const trackScrollPosition = () => {
  if (contentWrapper.value) {
    lastScrollPosition.value = contentWrapper.value.scrollTop
    
    // Debounce saving to avoid too many updates
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(saveScrollPosition, 1000) // Save after 1 second of no scrolling
  }
}

// Computed properties
const progressPercentage = computed(() => {
  if (totalChapters.value === 0) return 0
  return ((currentChapterIndex.value + 1) / totalChapters.value) * 100
})

const estimatedReadingTime = computed(() => {
  // Rough estimation: 250 words per minute
  if (!processedChapterContent.value) return 0
  const text = processedChapterContent.value.replace(/<[^>]*>/g, '')
  const wordCount = text.split(/\s+/).length
  const remainingChapters = totalChapters.value - currentChapterIndex.value - 1
  const avgWordsPerChapter = wordCount // Simplified for now
  const totalRemainingWords = avgWordsPerChapter * remainingChapters
  return Math.ceil(totalRemainingWords / 250)
})

function handleSelection() {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed) return
  const text = sel.toString().trim()
  if (!text) return

  // find paragraph element
  let node = sel.anchorNode
  if (node && node.nodeType === 3) node = node.parentElement // text node -> parent
  const para = node?.closest('p')
  if (!para) return
  const paraNumAttr = para.getAttribute('data-paragraph-number')
  const paraNum = paraNumAttr ? parseInt(paraNumAttr) : null

  // Store selection data and show modal
  selectedText.value = text
  selectedParagraphNumber.value = paraNum
  showNoteModal.value = true
}

function addNoteToNotebook(note) {
  const citation = `Chapter: ${currentChapter.value?.title || 'Unknown'}${
    selectedParagraphNumber.value ? `, Paragraph ${selectedParagraphNumber.value}` : ''
  }`
  
  const fullNote = `${note.content}\n\n---\n📖 ${citation}\n💭 "${selectedText.value}"`
  
  addToNotebook(bookId.value, fullNote)
  showNoteModal.value = false
  clearSelection()
}

function cancelNoteAdd() {
  showNoteModal.value = false
  clearSelection()
}

function clearSelection() {
  selectedText.value = ''
  selectedParagraphNumber.value = null
  window.getSelection()?.removeAllRanges()
}

// Debug function to test scrolling
const testScroll = () => {
  const wrapper = document.querySelector('.chapter-content-wrapper')
  console.log('Test scroll - wrapper found:', !!wrapper)
  
  if (wrapper) {
    const currentScroll = wrapper.scrollTop
    const scrollHeight = wrapper.scrollHeight
    const clientHeight = wrapper.clientHeight
    const maxScroll = scrollHeight - clientHeight
    
    console.log('Scroll info:', {
      currentScroll,
      scrollHeight,
      clientHeight,
      maxScroll,
      isScrollable: maxScroll > 0
    })
    
    if (maxScroll > 0) {
      const targetScroll = Math.min(500, maxScroll)
      console.log('Scrolling to:', targetScroll)
      wrapper.scrollTop = targetScroll
      
      setTimeout(() => {
        console.log('Scroll result:', wrapper.scrollTop)
      }, 100)
    }
  }
}

// Save before page unload (refresh/close)
const handleBeforeUnload = () => {
  // Cancel any pending saves
  clearTimeout(scrollTimeout)
  // Save immediately
  saveScrollPosition()
}

// Lifecycle hooks
onMounted(() => {
  // Add beforeunload listener for page refresh
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // Setup scroll tracking after DOM is ready
  const setupScrollTracking = () => {
    if (contentWrapper.value) {
      contentWrapper.value.addEventListener('scroll', trackScrollPosition)
      console.log('Scroll listener attached to ref')
      return true
    }
    // Fallback to querySelector if ref not ready
    const wrapper = document.querySelector('.chapter-content-wrapper')
    if (wrapper) {
      contentWrapper.value = wrapper
      wrapper.addEventListener('scroll', trackScrollPosition)
      console.log('Scroll listener attached via querySelector')
      return true
    }
    return false
  }
  
  // Try to set up scroll tracking immediately and with delays
  if (!setupScrollTracking()) {
    nextTick(() => {
      if (!setupScrollTracking()) {
        setTimeout(setupScrollTracking, 100)
      }
    })
  }
  
  // Restore scroll position if available
  const book = getBook(bookId.value)
  if (book?.readingProgress?.scrollPosition > 0 && book?.readingProgress?.currentChapter === currentChapterIndex.value) {
    console.log('Found saved scroll position on mount:', book.readingProgress.scrollPosition)
    // Store it for restoration after content loads
    window.__savedScrollPosition = book.readingProgress.scrollPosition
    
    // If content is already loaded, restore immediately
    if (processedChapterContent.value && !hasRestoredScroll.value) {
      console.log('Content already loaded, restoring scroll immediately')
      hasRestoredScroll.value = true
      
      // Wait a bit for DOM to settle
      setTimeout(() => {
        const wrapper = document.querySelector('.chapter-content-wrapper')
        if (wrapper && book.readingProgress.scrollPosition > 0) {
          const targetScroll = book.readingProgress.scrollPosition
          console.log('Immediate scroll restoration to:', targetScroll)
          wrapper.scrollTop = targetScroll
          lastScrollPosition.value = targetScroll
          
          // Verify after a moment
          setTimeout(() => {
            console.log('Immediate scroll verification:', {
              target: targetScroll,
              actual: wrapper.scrollTop
            })
          }, 100)
        }
      }, 300)
    }
  }
})

onUnmounted(() => {
  // Remove listeners
  if (contentWrapper.value) {
    contentWrapper.value.removeEventListener('scroll', trackScrollPosition)
  }
  window.removeEventListener('beforeunload', handleBeforeUnload)
  
  // Clear timeout and save final position
  clearTimeout(scrollTimeout)
  saveScrollPosition()
})

// Watch for chapter changes to save progress
watch(currentChapterIndex, (newIndex, oldIndex) => {
  if (oldIndex !== undefined && bookId.value && bookId.value !== 'unknown-book') {
    // Save progress when changing chapters
    updateBookProgress(bookId.value, newIndex, 0)
  }
  
  // Reset scroll position for new chapter
  lastScrollPosition.value = 0
  hasRestoredScroll.value = false
  
  // Scroll tracking will be re-initialized by the ref
})

// Flag to track if we've already restored scroll for this session
const hasRestoredScroll = ref(false)

// Watch contentWrapper ref to ensure scroll tracking is set up
watch(contentWrapper, (newWrapper, oldWrapper) => {
  if (newWrapper && !oldWrapper) {
    console.log('ContentWrapper ref is now available')
    // Ensure scroll listener is attached
    if (!newWrapper._scrollListenerAttached) {
      newWrapper.addEventListener('scroll', trackScrollPosition)
      newWrapper._scrollListenerAttached = true
      console.log('Scroll listener attached via ref watch')
    }
  }
})

// Watch for chapter content changes to handle initial load and restoration
watch(
  () => processedChapterContent.value,
  async (newContent) => {
    console.log('ProcessedChapterContent changed, hasRestoredScroll:', hasRestoredScroll.value)
    if (newContent && !hasRestoredScroll.value) {
    // Wait for DOM to update
    await nextTick()
    
    // Get saved scroll position from various sources
    let savedScrollPosition = window.__savedScrollPosition || 0
    
    // If no position in window, check library state
    if (savedScrollPosition === 0) {
      const book = getBook(bookId.value)
      console.log('Checking book for saved position:', {
        bookId: bookId.value,
        book: book,
        readingProgress: book?.readingProgress,
        currentChapter: currentChapterIndex.value
      })
      if (book?.readingProgress?.currentChapter === currentChapterIndex.value) {
        savedScrollPosition = book.readingProgress.scrollPosition || 0
      }
    }
    
    console.log('Saved scroll position sources:', {
      fromWindow: window.__savedScrollPosition,
      fromLibrary: savedScrollPosition,
      willRestore: savedScrollPosition > 0
    })
    
    if (savedScrollPosition > 0) {
      console.log('Attempting to restore scroll position:', savedScrollPosition)
      hasRestoredScroll.value = true
      
      // Multiple attempts to restore scroll position
      let attemptCount = 0
      const maxAttempts = 15
      
      const attemptScrollRestore = () => {
        attemptCount++
        
        // Try to get content wrapper if not already available
        if (!contentWrapper.value) {
          const wrapper = document.querySelector('.chapter-content-wrapper')
          if (wrapper) {
            contentWrapper.value = wrapper
            console.log(`Scroll restore attempt ${attemptCount}: Found content wrapper via querySelector`)
          } else {
            console.log(`Scroll restore attempt ${attemptCount}: No content wrapper yet`)
            if (attemptCount < maxAttempts) {
              setTimeout(attemptScrollRestore, 100 * attemptCount)
            }
            return
          }
        }
        
        const scrollHeight = contentWrapper.value.scrollHeight
        const clientHeight = contentWrapper.value.clientHeight
        const maxScroll = scrollHeight - clientHeight
        
        console.log(`Scroll restore attempt ${attemptCount}:`, {
          savedPosition: savedScrollPosition,
          scrollHeight,
          clientHeight,
          maxScroll,
          currentScroll: contentWrapper.value.scrollTop
        })
        
        // Check if content is scrollable
        if (scrollHeight <= clientHeight || maxScroll <= 0) {
          console.log('Content not yet scrollable, retrying...')
          if (attemptCount < maxAttempts) {
            setTimeout(attemptScrollRestore, 200 * attemptCount)
          }
          return
        }
        
        // Calculate target scroll position
        const targetScroll = Math.min(savedScrollPosition, maxScroll)
        
        // Apply scroll position using multiple methods
        console.log('Applying scroll position:', targetScroll)
        contentWrapper.value.scrollTop = targetScroll
        
        // Force a reflow to ensure the scroll is applied
        void contentWrapper.value.offsetHeight
        
        // Also try scrollTo method
        if (contentWrapper.value.scrollTo) {
          contentWrapper.value.scrollTo({
            top: targetScroll,
            left: 0,
            behavior: 'instant'
          })
        }
        
        // Try setting scrollTop again after a microtask
        Promise.resolve().then(() => {
          if (contentWrapper.value) {
            contentWrapper.value.scrollTop = targetScroll
          }
        })
        
        // Verify scroll was applied
        setTimeout(() => {
          if (contentWrapper.value) {
            const actualScroll = contentWrapper.value.scrollTop
            const diff = Math.abs(actualScroll - targetScroll)
            
            console.log('Scroll verification:', {
              target: targetScroll,
              actual: actualScroll,
              difference: diff
            })
            
            if (diff > 10 && attemptCount < maxAttempts) {
              // Try again if scroll didn't work
              setTimeout(attemptScrollRestore, 300)
            } else {
              // Success or max attempts reached
              lastScrollPosition.value = actualScroll
              console.log('Scroll restoration complete at position:', actualScroll)
              
              // Clear saved position
              if (window.__savedScrollPosition) {
                delete window.__savedScrollPosition
              }
              
              // Handle late-loading images
              const images = contentWrapper.value.querySelectorAll('img')
              if (images.length > 0) {
                let imagesLoaded = 0
                const checkAllImagesLoaded = () => {
                  imagesLoaded++
                  if (imagesLoaded === images.length) {
                    // Re-apply scroll after all images load
                    setTimeout(() => {
                      if (contentWrapper.value) {
                        const newMaxScroll = contentWrapper.value.scrollHeight - contentWrapper.value.clientHeight
                        const newTarget = Math.min(savedScrollPosition, newMaxScroll)
                        contentWrapper.value.scrollTop = newTarget
                        console.log('Re-applied scroll after images loaded')
                      }
                    }, 100)
                  }
                }
                
                images.forEach(img => {
                  if (img.complete) {
                    checkAllImagesLoaded()
                  } else {
                    img.addEventListener('load', checkAllImagesLoaded, { once: true })
                    img.addEventListener('error', checkAllImagesLoaded, { once: true })
                  }
                })
              }
            }
          }
        }, 100)
      }
      
      // Start restoration attempts after a short delay
      setTimeout(attemptScrollRestore, 200)
      
      // Also try a direct approach after content is definitely rendered
      setTimeout(() => {
        const wrapper = document.querySelector('.chapter-content-wrapper')
        if (wrapper && savedScrollPosition > 0) {
          console.log('Direct scroll attempt after 1s delay')
          wrapper.scrollTop = savedScrollPosition
          
          // Verify it worked
          setTimeout(() => {
            console.log('Direct scroll verification:', {
              target: savedScrollPosition,
              actual: wrapper.scrollTop
            })
          }, 100)
        }
      }, 1000)
    }
  }
},
  { immediate: true }
)
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

.chapter-html p {
  margin: 0 0 1.5rem 0;
  text-align: justify;
  position: relative;
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