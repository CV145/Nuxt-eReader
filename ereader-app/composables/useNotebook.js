import { ref, computed, watch } from 'vue'

/**
 * Composable to manage notebooks (one per book)
 * Each notebook is identified by a `bookId` (preferably the EPUB identifier)
 * Instead of individual notes, each notebook now contains a single document
 * that users can add to and edit directly.
 * Persisted in localStorage to survive reloads.
 */

const STORAGE_KEY = 'nuxt-ereader-notebooks'

// Utilities for safe client-side storage access
function isClient () {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function loadFromStorage () {
  if (!isClient()) return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    console.warn('Failed to load notebooks from storage', e)
    return {}
  }
}

function saveToStorage () {
  if (!isClient()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks.value))
  } catch (e) {
    console.warn('Failed to save notebooks', e)
  }
}

// top-level reactive map bookId -> notebook
const notebooks = ref(loadFromStorage())

// Persist automatically whenever notebooks mutate
watch(
  notebooks,
  () => saveToStorage(),
  { deep: true }
)

export const useNotebook = () => {
  /**
   * Ensure a notebook exists for given bookId
   */
  const getNotebook = (bookId) => {
    if (!bookId) throw new Error('bookId is required')
    if (!notebooks.value[bookId]) {
      notebooks.value[bookId] = { 
        bookId, 
        content: '', // The full document content
        lastEdited: Date.now() 
      }
    }
    return notebooks.value[bookId]
  }

  /**
   * Adds text to the notebook document at cursor position or end
   */
  const addToNotebook = (bookId, textToAdd, options = {}) => {
    const nb = getNotebook(bookId)
    
    // Format the text with reference info if provided
    let formattedText = textToAdd
    if (options.sourceText || options.chapterTitle || options.paragraphNumber) {
      const citation = []
      if (options.chapterTitle) citation.push(options.chapterTitle)
      if (options.paragraphNumber) citation.push(`¶${options.paragraphNumber}`)
      
      formattedText = `${textToAdd}\n${citation.length ? `[${citation.join(', ')}]` : ''}\n\n`
      
      if (options.sourceText) {
        formattedText = `> ${options.sourceText}\n\n${formattedText}`
      }
    }
    
    // Add formatted text at current position or end
    const position = options.position ?? nb.content.length
    nb.content = nb.content.substring(0, position) + formattedText + nb.content.substring(position)
    nb.lastEdited = Date.now()
  }
  
  /**
   * Updates the entire document content
   */
  const updateNotebookContent = (bookId, newContent) => {
    const nb = getNotebook(bookId)
    nb.content = newContent
    nb.lastEdited = Date.now()
  }

  /**
   * Get the notebook content
   */
  const getNotebookContent = (bookId) => {
    return getNotebook(bookId).content
  }

  /**
   * Convenience: return reactive notebook content for a book
   */
  const useNotebookContent = (bookId) => {
    return computed(() => getNotebookContent(bookId))
  }

  return {
    getNotebook,
    addToNotebook,
    updateNotebookContent,
    getNotebookContent,
    useNotebookContent
  }
}
