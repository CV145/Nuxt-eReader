/**
 * Bookmark storage utility for managing bookmarks in localStorage
 */

const STORAGE_KEY = 'ereader-bookmarks'

/**
 * Get all bookmarks from storage
 * @returns {Object} Object with bookIds as keys and arrays of bookmarks as values
 */
export function getAllBookmarks() {
  if (typeof window === 'undefined' || !localStorage) return {}
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Failed to load bookmarks:', error)
    return {}
  }
}

/**
 * Get bookmarks for a specific book
 * @param {string} bookId - The book identifier
 * @returns {Array} Array of bookmarks for the book
 */
export function getBookBookmarks(bookId) {
  const allBookmarks = getAllBookmarks()
  return allBookmarks[bookId] || []
}

/**
 * Save a bookmark
 * @param {string} bookId - The book identifier
 * @param {Object} bookmark - The bookmark object
 * @returns {boolean} Success status
 */
export function saveBookmark(bookId, bookmark) {
  try {
    const allBookmarks = getAllBookmarks()
    
    if (!allBookmarks[bookId]) {
      allBookmarks[bookId] = []
    }
    
    // Check if bookmark already exists at this location
    const existingIndex = allBookmarks[bookId].findIndex(
      b => b.chapterIndex === bookmark.chapterIndex && 
          b.paragraphNumber === bookmark.paragraphNumber
    )
    
    if (existingIndex !== -1) {
      // Update existing bookmark
      allBookmarks[bookId][existingIndex] = {
        ...allBookmarks[bookId][existingIndex],
        ...bookmark,
        updatedAt: new Date().toISOString()
      }
    } else {
      // Add new bookmark
      allBookmarks[bookId].push({
        ...bookmark,
        id: generateBookmarkId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    
    // Sort bookmarks by chapter and paragraph
    allBookmarks[bookId].sort((a, b) => {
      if (a.chapterIndex !== b.chapterIndex) {
        return a.chapterIndex - b.chapterIndex
      }
      return a.paragraphNumber - b.paragraphNumber
    })
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allBookmarks))
    return true
  } catch (error) {
    console.error('Failed to save bookmark:', error)
    return false
  }
}

/**
 * Remove a bookmark
 * @param {string} bookId - The book identifier
 * @param {string} bookmarkId - The bookmark identifier
 * @returns {boolean} Success status
 */
export function removeBookmark(bookId, bookmarkId) {
  try {
    const allBookmarks = getAllBookmarks()
    
    if (!allBookmarks[bookId]) return false
    
    allBookmarks[bookId] = allBookmarks[bookId].filter(b => b.id !== bookmarkId)
    
    // Remove book entry if no bookmarks left
    if (allBookmarks[bookId].length === 0) {
      delete allBookmarks[bookId]
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allBookmarks))
    return true
  } catch (error) {
    console.error('Failed to remove bookmark:', error)
    return false
  }
}

/**
 * Remove bookmark by location
 * @param {string} bookId - The book identifier
 * @param {number} chapterIndex - The chapter index
 * @param {number} paragraphNumber - The paragraph number
 * @returns {boolean} Success status
 */
export function removeBookmarkByLocation(bookId, chapterIndex, paragraphNumber) {
  try {
    const allBookmarks = getAllBookmarks()
    
    if (!allBookmarks[bookId]) return false
    
    const bookmarkIndex = allBookmarks[bookId].findIndex(
      b => b.chapterIndex === chapterIndex && 
          b.paragraphNumber === paragraphNumber
    )
    
    if (bookmarkIndex === -1) return false
    
    allBookmarks[bookId].splice(bookmarkIndex, 1)
    
    // Remove book entry if no bookmarks left
    if (allBookmarks[bookId].length === 0) {
      delete allBookmarks[bookId]
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allBookmarks))
    return true
  } catch (error) {
    console.error('Failed to remove bookmark by location:', error)
    return false
  }
}

/**
 * Check if a location is bookmarked
 * @param {string} bookId - The book identifier
 * @param {number} chapterIndex - The chapter index
 * @param {number} paragraphNumber - The paragraph number
 * @returns {boolean} Whether the location is bookmarked
 */
export function isBookmarked(bookId, chapterIndex, paragraphNumber) {
  const bookmarks = getBookBookmarks(bookId)
  return bookmarks.some(
    b => b.chapterIndex === chapterIndex && 
        b.paragraphNumber === paragraphNumber
  )
}

/**
 * Clear all bookmarks for a book
 * @param {string} bookId - The book identifier
 * @returns {boolean} Success status
 */
export function clearBookBookmarks(bookId) {
  try {
    const allBookmarks = getAllBookmarks()
    delete allBookmarks[bookId]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allBookmarks))
    return true
  } catch (error) {
    console.error('Failed to clear book bookmarks:', error)
    return false
  }
}

/**
 * Generate a unique bookmark ID
 * @returns {string} Unique ID
 */
function generateBookmarkId() {
  return `bm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}