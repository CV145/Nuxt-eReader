<template>
  <div class="library-page">
    <!-- Animated Background -->
    <div class="background-pattern"></div>

    <!-- Page Header -->
    <header class="page-header glass">
      <div class="header-container">
        <div class="header-left">
          <NuxtLink to="/" class="back-link hover-lift">
            <Icon name="arrow-left" :size="20" />
            <span class="back-text">Home</span>
          </NuxtLink>
        </div>
        
        <h1 class="page-title gradient-text">Your Library</h1>
        
        <div class="header-right">
          <button @click="showUpload = !showUpload" class="btn-add hover-lift">
            <Icon name="plus" :size="20" />
            <span class="btn-text">Add Book</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Library Content -->
    <main class="library-content">
      <!-- Library Stats -->
      <div class="library-stats glass-white">
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <h3 class="stat-value">{{ books.length }}</h3>
            <p class="stat-label">Total Books</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📖</div>
          <div class="stat-info">
            <h3 class="stat-value">{{ recentlyReadCount }}</h3>
            <p class="stat-label">Recently Read</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💾</div>
          <div class="stat-info">
            <h3 class="stat-value">{{ formatTotalSize }}</h3>
            <p class="stat-label">Total Size</p>
          </div>
        </div>
      </div>

      <!-- Upload Section -->
      <transition name="expand">
        <div v-if="showUpload" class="upload-section glass-white">
          <div class="upload-header">
            <h2 class="upload-title">Add New Book</h2>
            <button @click="showUpload = false" class="btn-close">
              <Icon name="x" :size="20" />
            </button>
          </div>
          <FileUpload
            :is-loading="isLoading"
            :error="error"
            @file-selected="handleFileSelected"
            @load-file="handleLoadFile"
          />
        </div>
      </transition>

      <!-- Books Section -->
      <div class="books-section">
        <div v-if="books.length > 0" class="section-header">
          <h2 class="section-title">My Books</h2>
          <div class="view-options">
            <button 
              @click="viewMode = 'grid'" 
              class="view-btn"
              :class="{ active: viewMode === 'grid' }"
              title="Grid view"
            >
              <Icon name="grid" :size="20" />
            </button>
            <button 
              @click="viewMode = 'list'" 
              class="view-btn"
              :class="{ active: viewMode === 'list' }"
              title="List view"
            >
              <Icon name="list" :size="20" />
            </button>
          </div>
        </div>

        <div class="books-container glass-white">
          <BookGrid
            v-if="viewMode === 'grid'"
            :books="sortedBooks"
            @select-book="handleSelectBook"
            @delete-book="handleDeleteBook"
            @upload="showUpload = true"
          />
          <!-- List view can be implemented later -->
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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
    { name: 'description', content: 'Your personal EPUB library - manage and read your digital book collection' }
  ]
})

// State
const showUpload = ref(false)
const selectedFile = ref(null)
const viewMode = ref('grid') // 'grid' or 'list'

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

// Computed properties
const recentlyReadCount = computed(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return books.value.filter(book => 
    book.lastOpened && new Date(book.lastOpened) > oneWeekAgo
  ).length
})

const formatTotalSize = computed(() => {
  const totalBytes = books.value.reduce((sum, book) => sum + (book.fileSize || 0), 0)
  return formatFileSize(totalBytes)
})

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
    
    // Hide upload section with animation
    showUpload.value = false
    
    // Show success notification (could be a toast)
    setTimeout(() => {
      if (confirm('Book added successfully! Would you like to start reading now?')) {
        router.push(`/reader/${book.id}`)
      }
    }, 300)
  } catch (err) {
    console.error('Failed to add book:', err)
  }
}

const handleSelectBook = (book) => {
  router.push(`/reader/${book.id}`)
}

const handleDeleteBook = async (bookId) => {
  if (confirm('Are you sure you want to remove this book from your library?')) {
    await removeBook(bookId)
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
.library-page {
  min-height: 100vh;
  background: var(--bg-secondary);
  position: relative;
  overflow-x: hidden;
}

/* Background Pattern */
.background-pattern {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.03;
  background-image: 
    linear-gradient(30deg, var(--primary-color) 12%, transparent 12.5%, transparent 87%, var(--primary-color) 87.5%, var(--primary-color)),
    linear-gradient(150deg, var(--primary-color) 12%, transparent 12.5%, transparent 87%, var(--primary-color) 87.5%, var(--primary-color)),
    linear-gradient(30deg, var(--primary-color) 12%, transparent 12.5%, transparent 87%, var(--primary-color) 87.5%, var(--primary-color)),
    linear-gradient(150deg, var(--primary-color) 12%, transparent 12.5%, transparent 87%, var(--primary-color) 87.5%, var(--primary-color));
  background-size: 80px 140px;
  background-position: 0 0, 0 0, 40px 70px, 40px 70px;
  pointer-events: none;
}

/* Page Header */
.page-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--primary-gradient);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-light);
  padding: 1.5rem 0;
  animation: slideDown 0.6s ease-out;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 2rem;
}

.header-left {
  display: flex;
  justify-content: flex-start;
}

.header-right {
  display: flex;
  justify-content: flex-end;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.back-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.back-text {
  display: inline-block;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  animation: fadeIn 0.8s ease-out;
}

.btn-add {
  background: white;
  color: var(--primary-color);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: var(--shadow-md);
}

.btn-add:hover {
  background: var(--bg-secondary);
}

.btn-text {
  display: inline-block;
}

/* Library Content */
.library-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  animation: fadeIn 0.8s ease-out 0.2s both;
}

/* Library Stats */
.library-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  padding: 2rem;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Upload Section */
.upload-section {
  margin-bottom: 3rem;
  padding: 2rem;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.upload-title {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 0.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Books Section */
.books-section {
  animation: fadeIn 0.8s ease-out 0.3s both;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  color: var(--text-primary);
  margin: 0;
}

.view-options {
  display: flex;
  gap: 0.5rem;
  background: var(--bg-tertiary);
  padding: 0.25rem;
  border-radius: var(--radius-lg);
}

.view-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.view-btn:hover {
  color: var(--text-primary);
}

.view-btn.active {
  background: white;
  color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.books-container {
  padding: 2rem;
  border-radius: var(--radius-xl);
  min-height: 400px;
  box-shadow: var(--shadow-sm);
}

/* Expand Transition */
.expand-enter-active,
.expand-leave-active {
  transition: all var(--transition-slow) ease;
  transform-origin: top;
}

.expand-enter-from {
  transform: scaleY(0);
  opacity: 0;
}

.expand-leave-to {
  transform: scaleY(0);
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-container {
    grid-template-columns: auto 1fr auto;
  }
  
  .page-title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .header-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0 1rem;
  }
  
  .page-title {
    width: 100%;
    order: -1;
    font-size: 1.75rem;
    margin-bottom: 1rem;
  }
  
  .back-text,
  .btn-text {
    display: none;
  }
  
  .library-content {
    padding: 2rem 1rem;
  }
  
  .library-stats {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }
  
  .upload-section,
  .books-container {
    padding: 1.5rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .view-options {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
}
</style>