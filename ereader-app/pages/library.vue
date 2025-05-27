<template>
  <div class="library-page">
    <div class="page-header">
      <div class="header-content">
        <NuxtLink to="/" class="back-link">
          <Icon name="arrow-left" />
          Back to Home
        </NuxtLink>
        <h1>Your Library</h1>
        <button @click="showUpload = !showUpload" class="btn-primary">
          <Icon name="plus" />
          Add Book
        </button>
      </div>
    </div>

    <div class="library-content">
      <!-- Upload Section -->
      <transition name="slide">
        <div v-if="showUpload" class="upload-section">
          <FileUpload
            :is-loading="isLoading"
            :error="error"
            @file-selected="handleFileSelected"
            @load-file="handleLoadFile"
          />
        </div>
      </transition>

      <!-- Books Grid -->
      <div class="books-section">
        <BookGrid
          :books="sortedBooks"
          @select-book="handleSelectBook"
          @delete-book="handleDeleteBook"
          @upload="showUpload = true"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEpubReader } from '~/composables/useEpubReader'
import { useLibrary } from '~/composables/useLibrary'
import FileUpload from '~/components/ui/FileUpload.vue'
import Icon from '~/components/ui/Icon.vue'
import BookGrid from '~/components/library/BookGrid.vue'

// Router and route
const router = useRouter()
const route = useRoute()

// Page meta
useHead({
  title: 'Library - Nuxt eReader',
  meta: [
    { name: 'description', content: 'Your personal EPUB library' }
  ]
})

// State
const showUpload = ref(false)
const selectedFile = ref(null)

// Use composables
const {
  isLoading,
  error,
  loadEpub,
  parser,
  metadata
} = useEpubReader()

const {
  books,
  sortedBooks,
  addBook,
  removeBook,
  getBookFileData
} = useLibrary()

// Check for upload query param on mount
onMounted(() => {
  if (route.query.upload === 'true') {
    showUpload.value = true
  }
})

// Methods
const handleFileSelected = (file) => {
  selectedFile.value = file
}

const handleLoadFile = async (file) => {
  try {
    // Load the EPUB to get metadata
    await loadEpub(file)
    
    // Add to library
    const book = await addBook(file, {
      metadata: metadata.value,
      manifest: parser.value?.manifest,
      parser: parser.value
    })
    
    // Hide upload section
    showUpload.value = false
    
    // Optionally, navigate to reader
    if (confirm('Book added to library! Do you want to start reading now?')) {
      router.push(`/reader/${book.id}`)
    }
  } catch (err) {
    console.error('Failed to add book:', err)
  }
}

const handleSelectBook = (book) => {
  router.push(`/reader/${book.id}`)
}

const handleDeleteBook = async (bookId) => {
  if (confirm('Are you sure you want to delete this book from your library?')) {
    await removeBook(bookId)
  }
}
</script>

<style scoped>
.library-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.page-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-size: 0.875rem;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.back-link:hover {
  opacity: 1;
}

.page-header h1 {
  color: white;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  text-align: center;
}

.btn-primary {
  background: white;
  color: #667eea;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.library-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.upload-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.books-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 2rem;
  min-height: 400px;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
    order: -1;
    width: 100%;
    text-align: left;
  }
  
  .back-link {
    order: 1;
  }
  
  .btn-primary {
    order: 2;
    margin-left: auto;
  }
  
  .library-content {
    padding: 1rem;
  }
  
  .upload-section,
  .books-section {
    padding: 1.5rem;
  }
}
</style>