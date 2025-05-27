<template>
  <div class="book-grid">
    <div v-if="books.length === 0" class="empty-state">
      <Icon name="book-open" class="empty-icon" />
      <h3>Your library is empty</h3>
      <p>Upload your first EPUB book to get started</p>
      <button @click="$emit('upload')" class="btn-primary">
        Upload Book
      </button>
    </div>

    <div v-else class="grid-container">
      <div 
        v-for="book in books" 
        :key="book.id"
        class="book-card"
        @click="$emit('selectBook', book)"
      >
        <div class="book-cover">
          <img 
            v-if="book.metadata.coverImage" 
            :src="book.metadata.coverImage" 
            :alt="book.metadata.title"
            @error="handleImageError"
          />
          <div v-else class="cover-placeholder">
            <Icon name="book" class="placeholder-icon" />
            <span class="book-title-placeholder">{{ book.metadata.title }}</span>
          </div>
        </div>
        
        <div class="book-info">
          <h3 class="book-title" :title="book.metadata.title">
            {{ book.metadata.title }}
          </h3>
          <p class="book-author" :title="book.metadata.author">
            {{ book.metadata.author }}
          </p>
          
          <div class="book-actions">
            <button 
              @click.stop="$emit('selectBook', book)" 
              class="btn-read"
              title="Read"
            >
              <Icon name="book-open" />
            </button>
            <button 
              @click.stop="$emit('deleteBook', book.id)" 
              class="btn-delete"
              title="Delete"
            >
              <Icon name="trash" />
            </button>
          </div>
        </div>

        <div v-if="book.lastOpened" class="reading-progress">
          <span class="progress-text">
            Last read: {{ formatDate(book.lastOpened) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

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
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}
</script>

<style scoped>
.book-grid {
  width: 100%;
  padding: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.empty-state p {
  margin-bottom: 2rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
}

.book-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.book-cover {
  width: 100%;
  height: 280px;
  background: #f5f5f5;
  position: relative;
  overflow: hidden;
}

.book-cover img {
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
  background: linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%);
  padding: 1rem;
}

.placeholder-icon {
  font-size: 3rem;
  color: #999;
  margin-bottom: 1rem;
}

.book-title-placeholder {
  font-size: 0.875rem;
  color: #666;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.book-info {
  padding: 1rem;
}

.book-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
}

.book-author {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-read,
.btn-delete {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.btn-read {
  background: #667eea;
  color: white;
}

.btn-read:hover {
  background: #5a67d8;
}

.btn-delete {
  background: #f5f5f5;
  color: #666;
}

.btn-delete:hover {
  background: #ef4444;
  color: white;
}

.reading-progress {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .book-cover {
    height: 220px;
  }
}
</style>