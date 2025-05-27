<template>
  <Transition name="sidebar">
    <aside v-if="isOpen" class="bookmarks-sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">
          <Icon name="bookmark-fill" :size="24" />
          Bookmarks
        </h2>
        <button @click="$emit('close')" class="close-btn">
          <Icon name="x" :size="24" />
        </button>
      </div>

      <div class="bookmarks-content">
        <!-- Empty state -->
        <div v-if="bookmarks.length === 0" class="empty-state">
          <Icon name="bookmark" :size="48" />
          <h3>No bookmarks yet</h3>
          <p>Right-click on any paragraph to bookmark it</p>
        </div>

        <!-- Bookmarks list -->
        <div v-else class="bookmarks-list">
          <div v-for="(chapterBookmarks, chapterIndex) in groupedBookmarks" :key="chapterIndex" class="chapter-group">
            <h3 class="chapter-header">
              {{ chapterBookmarks[0].chapterTitle || `Chapter ${chapterBookmarks[0].chapterIndex + 1}` }}
              <span class="bookmark-count">{{ chapterBookmarks.length }}</span>
            </h3>
            
            <div class="bookmark-items">
              <div
                v-for="bookmark in chapterBookmarks"
                :key="bookmark.id"
                class="bookmark-item"
                @click="goToBookmark(bookmark)"
              >
                <div class="bookmark-info">
                  <div class="paragraph-number">¶{{ bookmark.paragraphNumber }}</div>
                  <div class="bookmark-text">
                    {{ bookmark.paragraphText || 'No preview available' }}
                  </div>
                  <div class="bookmark-meta">
                    <time :datetime="bookmark.createdAt" class="bookmark-date">
                      {{ formatDate(bookmark.createdAt) }}
                    </time>
                  </div>
                </div>
                <button
                  @click.stop="removeBookmark(bookmark.id)"
                  class="remove-btn"
                  title="Remove bookmark"
                >
                  <Icon name="trash" :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="bookmarks.length > 0" class="sidebar-footer">
        <button @click="clearAllBookmarks" class="clear-all-btn">
          Clear all bookmarks
        </button>
      </div>
    </aside>
  </Transition>

  <!-- Backdrop -->
  <Transition name="fade">
    <div v-if="isOpen" class="sidebar-backdrop" @click="$emit('close')"></div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useBookmarks } from '~/composables/useBookmarks'
import Icon from '~/components/ui/Icon.vue'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  bookId: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'navigate-to-bookmark'])

// Use bookmarks composable
const {
  currentBookBookmarks,
  removeBookmarkById,
  clearAllBookmarks,
  navigateToBookmark
} = useBookmarks()

// Computed
const bookmarks = computed(() => currentBookBookmarks.value)

const groupedBookmarks = computed(() => {
  const groups = {}
  bookmarks.value.forEach(bookmark => {
    const chapterIndex = bookmark.chapterIndex
    if (!groups[chapterIndex]) {
      groups[chapterIndex] = []
    }
    groups[chapterIndex].push(bookmark)
  })
  return groups
})

// Methods
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

const removeBookmark = (bookmarkId) => {
  removeBookmarkById(bookmarkId)
}

const goToBookmark = (bookmark) => {
  emit('navigate-to-bookmark', bookmark)
  emit('close')
}
</script>

<style scoped>
.bookmarks-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.1);
  z-index: var(--z-modal);
  display: flex;
  flex-direction: column;
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-modal) - 1);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--primary-gradient);
  color: white;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.bookmarks-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-state svg {
  opacity: 0.3;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

.bookmarks-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.chapter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chapter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.bookmark-count {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-full);
}

.bookmark-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bookmark-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
}

.bookmark-item:hover {
  background: var(--bg-secondary);
  transform: translateX(-4px);
}

.bookmark-info {
  flex: 1;
  min-width: 0;
}

.paragraph-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.bookmark-text {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-primary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 0.5rem;
}

.bookmark-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bookmark-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.remove-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 0.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.clear-all-btn {
  width: 100%;
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 0.75rem;
  border-radius: var(--radius-lg);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.clear-all-btn:hover {
  background: #ef4444;
  color: white;
}

/* Transitions */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform var(--transition-base);
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile */
@media (max-width: 768px) {
  .bookmarks-sidebar {
    width: 100%;
  }
}
</style>