import { ref, computed } from 'vue'
import { saveBookFile, getBookFile, deleteBookFile, isIndexedDBAvailable } from '~/utils/storage/bookStorage'

const books = ref([])
const isLoading = ref(false)
const error = ref(null)

export const useLibrary = () => {
  const loadLibrary = () => {
    try {
      const stored = localStorage.getItem('ebook-library')
      if (stored) {
        books.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load library:', e)
      error.value = 'Failed to load library'
    }
  }

  const saveLibrary = () => {
    try {
      localStorage.setItem('ebook-library', JSON.stringify(books.value))
    } catch (e) {
      console.error('Failed to save library:', e)
      error.value = 'Failed to save library'
    }
  }

  const addBook = async (file, epubData) => {
    try {
      isLoading.value = true
      error.value = null

      // Generate unique ID for the book
      const bookId = `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Convert file to base64 for storage
      const fileData = await fileToBase64(file)
      
      // Extract cover image if available
      let coverImage = null
      if (epubData.parser && epubData.parser.extractCoverImage) {
        try {
          coverImage = await epubData.parser.extractCoverImage()
        } catch (e) {
          console.warn('Failed to extract cover image:', e)
        }
      }

      // Store file data in IndexedDB if available
      const useIndexedDB = isIndexedDBAvailable() && file.size > 2 * 1024 * 1024 // Use IndexedDB for files > 2MB
      
      if (useIndexedDB) {
        await saveBookFile(bookId, fileData)
      }

      const book = {
        id: bookId,
        filename: file.name,
        fileSize: file.size,
        fileData: useIndexedDB ? null : fileData, // Only store in localStorage if small
        useIndexedDB: useIndexedDB,
        metadata: {
          title: epubData.metadata.title || file.name.replace('.epub', ''),
          author: epubData.metadata.author || 'Unknown Author',
          publisher: epubData.metadata.publisher || '',
          language: epubData.metadata.language || '',
          description: epubData.metadata.description || '',
          identifier: epubData.metadata.identifier || '',
          date: epubData.metadata.date || '',
          coverImage: coverImage
        },
        addedDate: new Date().toISOString(),
        lastOpened: null,
        readingProgress: {
          currentChapter: 0,
          scrollPosition: 0
        }
      }

      // Check if book already exists (by title and author)
      const existingIndex = books.value.findIndex(b => 
        b.metadata.title === book.metadata.title && 
        b.metadata.author === book.metadata.author
      )

      if (existingIndex > -1) {
        // Delete old file if stored in IndexedDB
        const oldBook = books.value[existingIndex]
        if (oldBook.useIndexedDB) {
          await deleteBookFile(oldBook.id)
        }
        // Update existing book
        books.value[existingIndex] = book
      } else {
        // Add new book
        books.value.push(book)
      }

      saveLibrary()
      return book
    } catch (e) {
      console.error('Failed to add book:', e)
      error.value = 'Failed to add book to library'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const removeBook = async (bookId) => {
    const index = books.value.findIndex(b => b.id === bookId)
    if (index > -1) {
      const book = books.value[index]
      
      // Delete from IndexedDB if stored there
      if (book.useIndexedDB) {
        try {
          await deleteBookFile(bookId)
        } catch (e) {
          console.error('Failed to delete book file from IndexedDB:', e)
        }
      }
      
      books.value.splice(index, 1)
      saveLibrary()
    }
  }

  const updateBookProgress = (bookId, chapter, scrollPosition) => {
    const book = books.value.find(b => b.id === bookId)
    if (book) {
      book.readingProgress = {
        currentChapter: chapter,
        scrollPosition: scrollPosition
      }
      book.lastOpened = new Date().toISOString()
      saveLibrary()
    }
  }

  const getBook = (bookId) => {
    return books.value.find(b => b.id === bookId)
  }

  const getBookFileData = async (book) => {
    if (!book) return null
    
    // If file data is stored in IndexedDB, retrieve it
    if (book.useIndexedDB) {
      try {
        const fileData = await getBookFile(book.id)
        if (!fileData) {
          throw new Error('Book file not found in IndexedDB')
        }
        return fileData
      } catch (e) {
        console.error('Failed to retrieve book file:', e)
        throw e
      }
    }
    
    // Otherwise, return the file data from the book object
    return book.fileData
  }

  const sortedBooks = computed(() => {
    return [...books.value].sort((a, b) => {
      // Sort by last opened first, then by added date
      if (a.lastOpened && b.lastOpened) {
        return new Date(b.lastOpened) - new Date(a.lastOpened)
      }
      if (a.lastOpened) return -1
      if (b.lastOpened) return 1
      return new Date(b.addedDate) - new Date(a.addedDate)
    })
  })

  const recentBooks = computed(() => {
    return sortedBooks.value.slice(0, 6)
  })

  // Helper functions
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }


  // Initialize library on first use
  if (books.value.length === 0) {
    loadLibrary()
  }

  return {
    books: computed(() => books.value),
    sortedBooks,
    recentBooks,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    addBook,
    removeBook,
    getBook,
    getBookFileData,
    updateBookProgress,
    loadLibrary,
    saveLibrary
  }
}