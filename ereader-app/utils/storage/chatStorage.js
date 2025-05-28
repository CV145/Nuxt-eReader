/**
 * Chat storage utility for managing AI conversations in localStorage
 */

const STORAGE_KEY = 'ereader-ai-chats'
const MAX_CONVERSATIONS_PER_BOOK = 10
const MAX_MESSAGES_PER_CONVERSATION = 100

/**
 * Get all chat conversations from storage
 * @returns {Object} Object with bookIds as keys and arrays of conversations as values
 */
export function getAllConversations() {
  if (typeof window === 'undefined' || !localStorage) return {}
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Failed to load conversations:', error)
    return {}
  }
}

/**
 * Get conversations for a specific book
 * @param {string} bookId - The book identifier
 * @returns {Array} Array of conversations for the book
 */
export function getBookConversations(bookId) {
  const allConversations = getAllConversations()
  return allConversations[bookId] || []
}

/**
 * Get a specific conversation
 * @param {string} bookId - The book identifier
 * @param {string} conversationId - The conversation identifier
 * @returns {Object|null} The conversation object or null
 */
export function getConversation(bookId, conversationId) {
  const bookConversations = getBookConversations(bookId)
  return bookConversations.find(conv => conv.id === conversationId) || null
}

/**
 * Create a new conversation
 * @param {string} bookId - The book identifier
 * @param {Object} metadata - Additional metadata for the conversation
 * @returns {Object} The created conversation
 */
export function createConversation(bookId, metadata = {}) {
  const conversation = {
    id: generateConversationId(),
    bookId,
    title: metadata.title || 'New Conversation',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      bookTitle: metadata.bookTitle || '',
      chapterIndex: metadata.chapterIndex || 0,
      ...metadata
    }
  }

  const allConversations = getAllConversations()
  if (!allConversations[bookId]) {
    allConversations[bookId] = []
  }

  // Add to beginning of array (most recent first)
  allConversations[bookId].unshift(conversation)

  // Limit number of conversations per book
  if (allConversations[bookId].length > MAX_CONVERSATIONS_PER_BOOK) {
    allConversations[bookId] = allConversations[bookId].slice(0, MAX_CONVERSATIONS_PER_BOOK)
  }

  saveConversations(allConversations)
  return conversation
}

/**
 * Add a message to a conversation
 * @param {string} bookId - The book identifier
 * @param {string} conversationId - The conversation identifier
 * @param {Object} message - The message object
 * @returns {boolean} Success status
 */
export function addMessage(bookId, conversationId, message) {
  try {
    const allConversations = getAllConversations()
    const bookConversations = allConversations[bookId] || []
    const conversationIndex = bookConversations.findIndex(conv => conv.id === conversationId)
    
    if (conversationIndex === -1) return false

    const conversation = bookConversations[conversationIndex]
    
    // Add message with metadata
    conversation.messages.push({
      ...message,
      id: generateMessageId(),
      timestamp: new Date().toISOString()
    })

    // Limit number of messages
    if (conversation.messages.length > MAX_MESSAGES_PER_CONVERSATION) {
      // Keep system message and recent messages
      const systemMessage = conversation.messages.find(m => m.role === 'system')
      const recentMessages = conversation.messages.slice(-MAX_MESSAGES_PER_CONVERSATION + 1)
      conversation.messages = systemMessage ? [systemMessage, ...recentMessages] : recentMessages
    }

    // Update conversation metadata
    conversation.updatedAt = new Date().toISOString()
    
    // Update title if it's the first user message
    if (conversation.messages.filter(m => m.role === 'user').length === 1 && message.role === 'user') {
      conversation.title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
    }

    // Move conversation to top
    bookConversations.splice(conversationIndex, 1)
    bookConversations.unshift(conversation)
    allConversations[bookId] = bookConversations

    saveConversations(allConversations)
    return true
  } catch (error) {
    console.error('Failed to add message:', error)
    return false
  }
}

/**
 * Update conversation metadata
 * @param {string} bookId - The book identifier
 * @param {string} conversationId - The conversation identifier
 * @param {Object} updates - Updates to apply
 * @returns {boolean} Success status
 */
export function updateConversation(bookId, conversationId, updates) {
  try {
    const allConversations = getAllConversations()
    const bookConversations = allConversations[bookId] || []
    const conversation = bookConversations.find(conv => conv.id === conversationId)
    
    if (!conversation) return false

    Object.assign(conversation, updates, {
      updatedAt: new Date().toISOString()
    })

    saveConversations(allConversations)
    return true
  } catch (error) {
    console.error('Failed to update conversation:', error)
    return false
  }
}

/**
 * Delete a conversation
 * @param {string} bookId - The book identifier
 * @param {string} conversationId - The conversation identifier
 * @returns {boolean} Success status
 */
export function deleteConversation(bookId, conversationId) {
  try {
    const allConversations = getAllConversations()
    
    if (!allConversations[bookId]) return false
    
    allConversations[bookId] = allConversations[bookId].filter(
      conv => conv.id !== conversationId
    )
    
    // Remove book entry if no conversations left
    if (allConversations[bookId].length === 0) {
      delete allConversations[bookId]
    }
    
    saveConversations(allConversations)
    return true
  } catch (error) {
    console.error('Failed to delete conversation:', error)
    return false
  }
}

/**
 * Clear all conversations for a book
 * @param {string} bookId - The book identifier
 * @returns {boolean} Success status
 */
export function clearBookConversations(bookId) {
  try {
    const allConversations = getAllConversations()
    delete allConversations[bookId]
    saveConversations(allConversations)
    return true
  } catch (error) {
    console.error('Failed to clear book conversations:', error)
    return false
  }
}

/**
 * Save conversations to localStorage
 * @param {Object} conversations - The conversations object
 */
function saveConversations(conversations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
}

/**
 * Generate a unique conversation ID
 * @returns {string} Unique ID
 */
function generateConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate a unique message ID
 * @returns {string} Unique ID
 */
function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}