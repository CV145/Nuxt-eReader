import { ref, computed } from 'vue'
import {
  getAllBookmarks,
  getBookBookmarks,
  saveBookmark,
  removeBookmark,
  removeBookmarkByLocation,
  isBookmarked,
  clearBookBookmarks
} from '~/utils/storage/bookmarkStorage'

// Singleton state
const bookmarks = ref({})
const currentBookId = ref(null)

export const useBookmarks = () => {
  // Initialize bookmarks from storage
  const initializeBookmarks = () => {
    bookmarks.value = getAllBookmarks()
  }

  // Set current book
  const setCurrentBook = (bookId) => {
    currentBookId.value = bookId
    initializeBookmarks()
  }

  // Computed properties
  const currentBookBookmarks = computed(() => {
    if (!currentBookId.value) return []
    return bookmarks.value[currentBookId.value] || []
  })

  const bookmarkCount = computed(() => {
    if (!currentBookId.value) return 0
    return currentBookBookmarks.value.length
  })

  // Add or update a bookmark
  const addBookmark = (bookmarkData) => {
    if (!currentBookId.value) {
      console.error('No book ID set for bookmarks')
      return false
    }

    const bookmark = {
      chapterIndex: bookmarkData.chapterIndex,
      chapterTitle: bookmarkData.chapterTitle || '',
      paragraphNumber: bookmarkData.paragraphNumber,
      paragraphText: bookmarkData.paragraphText || '',
      note: bookmarkData.note || ''
    }

    const success = saveBookmark(currentBookId.value, bookmark)
    if (success) {
      initializeBookmarks()
    }
    return success
  }

  // Remove a bookmark by ID
  const removeBookmarkById = (bookmarkId) => {
    if (!currentBookId.value) return false

    const success = removeBookmark(currentBookId.value, bookmarkId)
    if (success) {
      initializeBookmarks()
    }
    return success
  }

  // Remove a bookmark by location
  const removeBookmarkAtLocation = (chapterIndex, paragraphNumber) => {
    if (!currentBookId.value) return false

    const success = removeBookmarkByLocation(
      currentBookId.value,
      chapterIndex,
      paragraphNumber
    )
    if (success) {
      initializeBookmarks()
    }
    return success
  }

  // Toggle bookmark at location
  const toggleBookmark = (bookmarkData) => {
    if (!currentBookId.value) return false

    const bookmarked = isBookmarked(
      currentBookId.value,
      bookmarkData.chapterIndex,
      bookmarkData.paragraphNumber
    )

    if (bookmarked) {
      return removeBookmarkAtLocation(
        bookmarkData.chapterIndex,
        bookmarkData.paragraphNumber
      )
    } else {
      return addBookmark(bookmarkData)
    }
  }

  // Check if a location is bookmarked
  const isLocationBookmarked = (chapterIndex, paragraphNumber) => {
    if (!currentBookId.value) return false
    return isBookmarked(currentBookId.value, chapterIndex, paragraphNumber)
  }

  // Get bookmark for a specific location
  const getBookmarkAtLocation = (chapterIndex, paragraphNumber) => {
    if (!currentBookId.value) return null
    
    return currentBookBookmarks.value.find(
      b => b.chapterIndex === chapterIndex && 
          b.paragraphNumber === paragraphNumber
    )
  }

  // Clear all bookmarks for current book
  const clearAllBookmarks = () => {
    if (!currentBookId.value) return false

    const success = clearBookBookmarks(currentBookId.value)
    if (success) {
      initializeBookmarks()
    }
    return success
  }

  // Get bookmarks for a specific chapter
  const getChapterBookmarks = (chapterIndex) => {
    return currentBookBookmarks.value.filter(
      b => b.chapterIndex === chapterIndex
    )
  }

  // Navigate to a bookmark
  const navigateToBookmark = (bookmark, navigationCallback) => {
    if (navigationCallback && typeof navigationCallback === 'function') {
      navigationCallback(bookmark.chapterIndex, bookmark.paragraphNumber)
    }
  }

  // Initialize on first use
  if (Object.keys(bookmarks.value).length === 0) {
    initializeBookmarks()
  }

  return {
    // State
    bookmarks: computed(() => bookmarks.value),
    currentBookBookmarks,
    bookmarkCount,
    currentBookId: computed(() => currentBookId.value),

    // Methods
    setCurrentBook,
    addBookmark,
    removeBookmarkById,
    removeBookmarkAtLocation,
    toggleBookmark,
    isLocationBookmarked,
    getBookmarkAtLocation,
    clearAllBookmarks,
    getChapterBookmarks,
    navigateToBookmark,
    initializeBookmarks
  }
}