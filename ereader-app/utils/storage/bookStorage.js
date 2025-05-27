// IndexedDB storage for EPUB files
const DB_NAME = 'ereader-library'
const DB_VERSION = 1
const STORE_NAME = 'books'

let db = null

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'))
    }

    request.onsuccess = (event) => {
      db = event.target.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result
      
      // Create object store if it doesn't exist
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

// Save book file to IndexedDB
export const saveBookFile = async (bookId, fileData) => {
  try {
    const database = await initDB()
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    const request = store.put({ id: bookId, fileData })
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(new Error('Failed to save book file'))
    })
  } catch (error) {
    console.error('Error saving book file:', error)
    throw error
  }
}

// Get book file from IndexedDB
export const getBookFile = async (bookId) => {
  try {
    const database = await initDB()
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    const request = store.get(bookId)
    
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const result = event.target.result
        resolve(result ? result.fileData : null)
      }
      request.onerror = () => reject(new Error('Failed to get book file'))
    })
  } catch (error) {
    console.error('Error getting book file:', error)
    throw error
  }
}

// Delete book file from IndexedDB
export const deleteBookFile = async (bookId) => {
  try {
    const database = await initDB()
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    const request = store.delete(bookId)
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(new Error('Failed to delete book file'))
    })
  } catch (error) {
    console.error('Error deleting book file:', error)
    throw error
  }
}

// Check if IndexedDB is available
export const isIndexedDBAvailable = () => {
  try {
    return 'indexedDB' in window && indexedDB !== null
  } catch (e) {
    return false
  }
}