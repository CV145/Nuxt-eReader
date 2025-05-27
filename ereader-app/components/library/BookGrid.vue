<template>
  <div class="book-grid">
    <!-- Empty State -->
    <div v-if="books.length === 0" class="empty-state">
      <div class="empty-illustration">
        <div class="book-stack">
          <div class="book book-1"></div>
          <div class="book book-2"></div>
          <div class="book book-3"></div>
        </div>
      </div>
      <h3 class="empty-title">Your Library Awaits</h3>
      <p class="empty-description">Upload your first EPUB book to start building your digital library</p>
      <button @click="$emit('upload')" class="btn-upload hover-lift">
        <Icon name="upload" :size="20" />
        Upload Your First Book
      </button>
    </div>

    <!-- Books Grid -->
    <div v-else class="grid-container">
      <TransitionGroup name="book-list" tag="div" class="books-grid">
        <div 
          v-for="book in books" 
          :key="book.id"
          class="book-card hover-lift"
          @click="$emit('selectBook', book)"
        >
          <!-- Cover Section -->
          <div class="book-cover">
            <img 
              v-if="book.metadata.coverImage" 
              :src="book.metadata.coverImage" 
              :alt="book.metadata.title"
              class="cover-image"
              @error="handleImageError"
            />
            <div v-else class="cover-placeholder">
              <div class="placeholder-pattern"></div>
              <Icon name="book" :size="48" class="placeholder-icon" />
              <h4 class="placeholder-title">{{ book.metadata.title }}</h4>
            </div>
            
            <!-- Reading Progress Badge -->
            <div v-if="book.lastOpened" class="progress-badge glass">
              <Icon name="clock" :size="14" />
              {{ formatDate(book.lastOpened) }}
            </div>
          </div>
          
          <!-- Book Info -->
          <div class="book-info">
            <h3 class="book-title" :title="book.metadata.title">
              {{ book.metadata.title }}
            </h3>
            <p class="book-author" :title="book.metadata.author">
              {{ book.metadata.author }}
            </p>
            
            <div class="book-meta">
              <span class="book-size">
                <Icon name="file" :size="14" />
                {{ formatFileSize(book.fileSize) }}
              </span>
              <span v-if="book.useIndexedDB" class="storage-type" title="Stored in browser database">
                <Icon name="database" :size="14" />
              </span>
            </div>
          </div>

          <!-- Hover Actions -->
          <div class="book-actions">
            <button 
              @click.stop="$emit('selectBook', book)" 
              class="action-btn btn-read"
              title="Start Reading"
            >
              <Icon name="book-open" :size="18" />
              Read
            </button>
            <button 
              @click.stop="$emit('deleteBook', book.id)" 
              class="action-btn btn-delete"
              title="Remove from Library"
            >
              <Icon name="trash" :size="18" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import Icon from '~/components/ui/Icon.vue'

const props = defineProps({
  books: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['selectBook', 'deleteBook', 'upload'])

const handleImageError = (event) => {
  event.target.style.display = 'none'
  event.target.parentElement.classList.add('error')
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60))
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes}m ago`
    }
    return `${diffHours}h ago`
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
.book-grid {
  width: 100%;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.6s ease-out;
}

.empty-illustration {
  margin-bottom: 2rem;
  position: relative;
  height: 120px;
  width: 150px;
}

.book-stack {
  position: relative;
  height: 100%;
  width: 100%;
  transform: rotate(-5deg);
}

.book {
  position: absolute;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  transform-origin: left center;
}

.book-1 {
  width: 100px;
  height: 140px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  bottom: 0;
  left: 20px;
  transform: rotate(-10deg);
  box-shadow: var(--shadow-md);
}

.book-2 {
  width: 90px;
  height: 130px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  bottom: 10px;
  left: 35px;
  transform: rotate(0deg);
  box-shadow: var(--shadow-md);
}

.book-3 {
  width: 95px;
  height: 135px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  bottom: 5px;
  left: 50px;
  transform: rotate(10deg);
  box-shadow: var(--shadow-md);
  animation: float 3s ease-in-out infinite;
}

.empty-title {
  font-size: 1.75rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 400px;
}

.btn-upload {
  background: var(--primary-gradient);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-md);
}

.btn-upload:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Books Grid */
.grid-container {
  width: 100%;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2rem;
}

.book-card {
  background: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.book-card:hover {
  box-shadow: var(--shadow-xl);
}

.book-card:hover .book-actions {
  opacity: 1;
  transform: translateY(0);
}

/* Book Cover */
.book-cover {
  position: relative;
  width: 100%;
  height: 300px;
  background: var(--bg-tertiary);
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.placeholder-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.05) 10px, rgba(0,0,0,.05) 20px),
    repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0,0,0,.05) 10px, rgba(0,0,0,.05) 20px);
}

.placeholder-icon {
  color: var(--text-muted);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.placeholder-title {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.progress-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Book Info */
.book-info {
  padding: 1.25rem;
}

.book-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.375rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
}

.book-author {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.book-size,
.storage-type {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Book Actions */
.book-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
  padding: 1.5rem 1rem 1rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transform: translateY(10px);
  transition: all var(--transition-base);
}

.action-btn {
  flex: 1;
  padding: 0.625rem;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  transition: all var(--transition-fast);
}

.btn-read {
  background: white;
  color: var(--primary-color);
}

.btn-read:hover {
  background: var(--primary-color);
  color: white;
}

.btn-delete {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-delete:hover {
  background: #ef4444;
}

/* Transitions */
.book-list-enter-active,
.book-list-leave-active {
  transition: all var(--transition-base);
}

.book-list-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.book-list-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.book-list-move {
  transition: transform var(--transition-base);
}

/* Responsive Design */
@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.5rem;
  }
  
  .book-cover {
    height: 240px;
  }
  
  .book-info {
    padding: 1rem;
  }
  
  .book-title {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .books-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .book-cover {
    height: 200px;
  }
  
  .empty-state {
    padding: 3rem 1rem;
  }
  
  .empty-title {
    font-size: 1.5rem;
  }
}
</style>