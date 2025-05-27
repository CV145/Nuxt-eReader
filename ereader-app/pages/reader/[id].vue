<template>
  <div class="reader-page">
    <!-- Loading State -->
    <div v-if="isLoadingBook" class="loading-container">
      <Icon name="book-open" :size="48" class="loading-icon" />
      <p>Loading book...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="error-container">
      <Icon name="alert-circle" :size="48" />
      <h2>Error Loading Book</h2>
      <p>{{ loadError }}</p>
      <NuxtLink to="/library" class="btn-primary">
        Back to Library
      </NuxtLink>
    </div>

    <!-- Reader Interface -->
    <div v-else-if="isBookLoaded" class="reader-interface">
      <EpubReader 
        @show-toc="showToc = true" 
        @back-to-library="handleBackToLibrary" 
      />
      
      <!-- Table of Contents Modal -->
      <div v-if="showToc" class="toc-modal" @click="showToc = false">
        <div class="toc-container" @click.stop>
          <TableOfContents
            :toc="toc"
            :current-chapter-index="currentChapterIndex"
            @close="showToc = false"
            @navigate="handleTocNavigate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEpubReader } from '~/composables/useEpubReader'
import { useLibrary } from '~/composables/useLibrary'
import Icon from '~/components/ui/Icon.vue'
import EpubReader from '~/components/reader/EpubReader.vue'
import TableOfContents from '~/components/reader/TableOfContents.vue'

// Router and route
const route = useRoute()
const router = useRouter()

// Page meta
useHead({
  title: 'Reading - Nuxt eReader',
  meta: [
    { name: 'description', content: 'Reading your EPUB book' }
  ]
})

// State
const showToc = ref(false)
const isLoadingBook = ref(true)
const loadError = ref(null)

// Use composables
const {
  isLoading,
  error,
  isBookLoaded,
  toc,
  currentChapterIndex,
  loadEpub,
  goToHref,
  reset
} = useEpubReader()

const {
  getBook,
  updateBookProgress
} = useLibrary()

// Load book on mount
onMounted(async () => {
  const bookId = route.params.id
  
  try {
    // Get book from library
    const book = getBook(bookId)
    
    if (!book) {
      loadError.value = 'Book not found in library'
      isLoadingBook.value = false
      return
    }
    
    // Convert base64 back to file
    const response = await fetch(book.fileData)
    const blob = await response.blob()
    const file = new File([blob], book.filename, { type: 'application/epub+zip' })
    
    // Load the EPUB
    await loadEpub(file)
    
    // Update last opened
    updateBookProgress(bookId, book.readingProgress.currentChapter, 0)
    
    // Navigate to saved chapter if available
    if (book.readingProgress.currentChapter > 0) {
      // TODO: Implement loading specific chapter
    }
    
    isLoadingBook.value = false
  } catch (err) {
    console.error('Failed to load book:', err)
    loadError.value = err.message || 'Failed to load book'
    isLoadingBook.value = false
  }
})

// Save progress on unmount
onUnmounted(() => {
  const bookId = route.params.id
  if (bookId && isBookLoaded.value) {
    updateBookProgress(bookId, currentChapterIndex.value, 0)
  }
})

// Methods
const handleTocNavigate = async (href) => {
  await goToHref(href)
  showToc.value = false
}

const handleBackToLibrary = () => {
  // Save reading progress
  const bookId = route.params.id
  if (bookId && isBookLoaded.value) {
    updateBookProgress(bookId, currentChapterIndex.value, 0)
  }
  
  // Navigate back to library
  router.push('/library')
}
</script>

<style scoped>
.reader-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: white;
  text-align: center;
  padding: 2rem;
}

.loading-icon {
  animation: pulse 2s infinite;
  margin-bottom: 1rem;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.error-container h2 {
  font-size: 2rem;
  margin: 1rem 0;
}

.error-container p {
  font-size: 1.125rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.btn-primary {
  background: white;
  color: #667eea;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.reader-interface {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.toc-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.toc-container {
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .toc-modal {
    padding: 1rem;
  }
}
</style>