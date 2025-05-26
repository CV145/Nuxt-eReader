<template>
  <div class="epub-reader">
    <!-- Reader Header -->
    <div class="reader-header">
      <div class="book-info">
        <h1 v-if="metadata.title" class="book-title">{{ metadata.title }}</h1>
        <p v-if="metadata.author" class="book-author">by {{ metadata.author }}</p>
      </div>
      
      <div class="reader-controls">
        <button 
          @click="toggleParagraphNumbers" 
          class="control-btn"
          :class="{ active: showParagraphNumbers }"
        >
          <Icon name="hash" />
          Paragraph Numbers
        </button>
        
        <button @click="$emit('showToc')" class="control-btn">
          <Icon name="list" />
          Table of Contents
        </button>
        
        <button @click="showNotebook = true" class="control-btn">
          <Icon name="edit" />
          Notebook
        </button>
      </div>
    </div>

    <!-- Chapter Navigation -->
    <div class="chapter-nav">
      <button 
        @click="previousChapter" 
        :disabled="!hasPreviousChapter || isLoading"
        class="nav-btn prev-btn"
      >
        <Icon name="chevron-left" />
        Previous
      </button>
      
      <div class="chapter-info">
        <span class="chapter-title">{{ currentChapter?.title || 'Loading...' }}</span>
        <span class="chapter-progress">
          {{ currentChapterIndex + 1 }} of {{ totalChapters }}
        </span>
      </div>
      
      <button 
        @click="nextChapter" 
        :disabled="!hasNextChapter || isLoading"
        class="nav-btn next-btn"
      >
        Next
        <Icon name="chevron-right" />
      </button>
    </div>

    <!-- Chapter Content -->
    <div class="chapter-container">
      <!-- Debug info -->
      <div style="background: #f0f0f0; padding: 1rem; margin-bottom: 1rem; font-family: monospace; font-size: 0.8rem;">
        <strong>Debug Info:</strong><br>
        isLoading: {{ isLoading }}<br>
        error: {{ error }}<br>
        hasCurrentChapter: {{ !!currentChapter }}<br>
        hasProcessedContent: {{ !!processedChapterContent }}<br>
        processedContentLength: {{ processedChapterContent?.length || 0 }}<br>
        currentChapterTitle: {{ currentChapter?.title }}<br>
      </div>
      
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading chapter...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <Icon name="alert-circle" />
        <p>{{ error }}</p>
      </div>
      
      <div 
        v-else-if="processedChapterContent" 
        class="chapter-content"
        v-html="processedChapterContent"
        @mouseup="handleSelection"
      ></div>
      
      <div v-else class="empty-state">
        <p>No content available</p>
        <p style="font-size: 0.8rem; color: #666;">
          Current chapter: {{ currentChapter ? 'exists' : 'null' }}<br>
          Processed content: {{ processedChapterContent ? 'exists' : 'empty' }}
        </p>
      </div>
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
import { ref, computed } from 'vue'
import { useEpubReader } from '~/composables/useEpubReader'
import { useNotebook } from '~/composables/useNotebook'
import Icon from '~/components/ui/Icon.vue'
import NotebookSidebar from '~/components/NotebookSidebar.vue'
import NoteAddModal from '~/components/notes/NoteAddModal.vue'

// Props
defineProps({
  // Add any props if needed
})

// Emits
defineEmits(['showToc'])

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

const bookId = computed(() => metadata.value?.identifier || metadata.value?.title || 'unknown-book')

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

function addNoteToNotebook(noteText) {
  // Add the note to the document
  addToNotebook(bookId.value, noteText, {
    sourceText: selectedText.value,
    chapterTitle: currentChapter.value?.title || `Chapter ${currentChapterIndex.value + 1}`,
    paragraphNumber: selectedParagraphNumber.value
  })
  
  // Close modal and clear selection
  cancelNoteAdd()
}

function cancelNoteAdd() {
  showNoteModal.value = false
  selectedText.value = ''
  selectedParagraphNumber.value = null
  window.getSelection()?.removeAllRanges()
}

// Expose methods to parent component
defineExpose({
  nextChapter,
  previousChapter,
  toggleParagraphNumbers
})
</script>

<style scoped>
.epub-reader {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fafafa;
}

.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.book-info {
  flex: 1;
}

.book-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.book-author {
  font-size: 1rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.reader-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.control-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.chapter-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #2563eb;
}

.nav-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.chapter-info {
  text-align: center;
  flex: 1;
  margin: 0 2rem;
}

.chapter-title {
  display: block;
  font-size: 1.125rem;
  font-weight: 500;
  color: #1f2937;
}

.chapter-progress {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.chapter-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.chapter-content {
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.7;
  font-size: 1.125rem;
  color: #1f2937;
}

/* Chapter content styling */
.chapter-content :deep(p) {
  margin-bottom: 1.5rem;
  text-align: justify;
}

.chapter-content :deep(h1),
.chapter-content :deep(h2),
.chapter-content :deep(h3),
.chapter-content :deep(h4),
.chapter-content :deep(h5),
.chapter-content :deep(h6) {
  margin: 2rem 0 1rem 0;
  font-weight: 600;
  color: #1f2937;
}

.chapter-content :deep(h1) { font-size: 2rem; }
.chapter-content :deep(h2) { font-size: 1.75rem; }
.chapter-content :deep(h3) { font-size: 1.5rem; }
.chapter-content :deep(h4) { font-size: 1.25rem; }

.chapter-content :deep(.paragraph-number) {
  display: inline-block;
  background: #3b82f6;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  margin-right: 0.5rem;
  vertical-align: top;
  line-height: 1.2;
}

.chapter-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
  border-radius: 0.375rem;
}

.chapter-content :deep(blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #4b5563;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  color: #6b7280;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  color: #dc2626;
}

/* Responsive design */
@media (max-width: 768px) {
  .reader-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .reader-controls {
    width: 100%;
    justify-content: center;
  }

  .chapter-nav {
    padding: 1rem;
  }

  .chapter-info {
    margin: 0 1rem;
  }

  .chapter-container {
    padding: 1rem;
  }

  .chapter-content {
    font-size: 1rem;
  }
}
</style>