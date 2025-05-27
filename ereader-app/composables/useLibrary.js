import { ref, computed } from 'vue'

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
        coverImage = await epubData.parser.extractCoverImage()
      }

      const book = {
        id: bookId,
        filename: file.name,
        fileSize: file.size,
        fileData: fileData,
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

  const removeBook = (bookId) => {
    const index = books.value.findIndex(b => b.id === bookId)
    if (index > -1) {
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
    updateBookProgress,
    loadLibrary,
    saveLibrary
  }
}