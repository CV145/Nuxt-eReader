import { ref, computed } from 'vue'
import { createDeepSeekClient } from '~/utils/ai/deepseekClient'
import { extractFullBookContent, createAIContext } from '~/utils/ai/bookContentExtractor'
import {
  getAllConversations,
  getBookConversations,
  getConversation,
  createConversation,
  addMessage,
  updateConversation,
  deleteConversation,
  clearBookConversations
} from '~/utils/storage/chatStorage'

// Singleton state
const conversations = ref({})
const currentBookId = ref(null)
const currentConversationId = ref(null)
const isLoading = ref(false)
const error = ref(null)
const bookContext = ref(null)
const fullBookContent = ref(null)
const isExtractingContent = ref(false)

// DeepSeek client
let deepseekClient = null

export const useAIChat = () => {
  // Initialize DeepSeek client
  if (!deepseekClient) {
    deepseekClient = createDeepSeekClient()
  }

  // Initialize conversations from storage
  const initializeConversations = () => {
    conversations.value = getAllConversations()
  }

  // Set current book and context
  const setCurrentBook = (bookId, context = null) => {
    currentBookId.value = bookId
    bookContext.value = context
    initializeConversations()
    
    // Load the most recent conversation or create a new one
    const bookConvs = conversations.value[bookId] || []
    if (bookConvs.length > 0) {
      currentConversationId.value = bookConvs[0].id
    } else {
      startNewConversation()
    }
  }

  // Set book context (metadata, current chapter, etc.)
  const setBookContext = (context) => {
    bookContext.value = context
  }

  // Extract full book content for AI context
  const extractBookContent = async (parser) => {
    if (!parser || isExtractingContent.value) return
    
    isExtractingContent.value = true
    try {
      console.log('Extracting full book content for AI context...')
      fullBookContent.value = await extractFullBookContent(parser)
      console.log(`Book content extracted: ${fullBookContent.value.totalWordCount} words across ${fullBookContent.value.chapters.length} chapters`)
    } catch (err) {
      console.error('Failed to extract book content:', err)
      fullBookContent.value = null
    } finally {
      isExtractingContent.value = false
    }
  }

  // Computed properties
  const currentBookConversations = computed(() => {
    if (!currentBookId.value) return []
    return conversations.value[currentBookId.value] || []
  })

  const currentConversation = computed(() => {
    if (!currentBookId.value || !currentConversationId.value) return null
    return getConversation(currentBookId.value, currentConversationId.value)
  })

  const messages = computed(() => {
    return currentConversation.value?.messages || []
  })

  const conversationCount = computed(() => {
    if (!currentBookId.value) return 0
    return currentBookConversations.value.length
  })

  // Start a new conversation
  const startNewConversation = () => {
    if (!currentBookId.value) {
      console.error('No book ID set for AI chat')
      return null
    }

    const metadata = {
      bookTitle: bookContext.value?.title || '',
      chapterIndex: bookContext.value?.chapterIndex || 0,
      chapterTitle: bookContext.value?.chapterTitle || ''
    }

    const conversation = createConversation(currentBookId.value, metadata)
    currentConversationId.value = conversation.id
    initializeConversations()

    // Add system message with book context
    const systemMessage = createSystemMessage()
    addMessage(currentBookId.value, conversation.id, systemMessage)
    
    return conversation
  }

  // Create system message with book context
  const createSystemMessage = () => {
    let content = `You are an AI assistant helping a reader understand and discuss the book "${bookContext.value?.title || 'this book'}".`
    
    if (bookContext.value?.author) {
      content += ` The book is written by ${bookContext.value.author}.`
    }
    
    if (bookContext.value?.currentChapter) {
      content += ` The reader is currently on chapter: "${bookContext.value.currentChapter}".`
    }
    
    // Add full book context if available
    if (fullBookContent.value) {
      content += `\n\nYou have access to the COMPLETE content of this book (${fullBookContent.value.totalWordCount} words, ${fullBookContent.value.chapters.length} chapters). You can discuss any part of the book including:`
      content += `\n- The overall plot and story arc`
      content += `\n- All characters and their development throughout the book`
      content += `\n- Themes, symbols, and literary devices used`
      content += `\n- Specific events from any chapter`
      content += `\n- Connections between different parts of the book`
      
      // Add the actual book content as context
      const aiContext = createAIContext(fullBookContent.value, {
        currentChapterIndex: bookContext.value?.chapterIndex || 0,
        includeFullText: fullBookContent.value.totalWordCount < 50000 // Include full text for books under 50k words
      })
      
      content += `\n\n[BOOK CONTENT CONTEXT]\n${aiContext}`
    } else {
      content += ` You have access to the current chapter's content. Be helpful and insightful based on the available context.`
    }
    
    content += `\n\nWhen answering questions:`
    content += `\n- Be specific and reference chapter names or numbers when discussing events`
    content += `\n- Provide insightful analysis while avoiding spoilers unless asked`
    content += `\n- Encourage deeper understanding of the text`
    content += `\n- If asked about parts you're unsure of, acknowledge the limitation`

    return {
      role: 'system',
      content
    }
  }

  // Send a message to the AI
  const sendMessage = async (content, options = {}) => {
    if (!currentBookId.value || !currentConversationId.value) {
      error.value = 'No active conversation'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      // Add user message
      const userMessage = {
        role: 'user',
        content
      }
      addMessage(currentBookId.value, currentConversationId.value, userMessage)
      initializeConversations()

      // Prepare messages for API
      const apiMessages = prepareMessagesForAPI()

      // Get AI response
      if (options.stream) {
        // Streaming response
        let assistantContent = ''
        const assistantMessage = {
          role: 'assistant',
          content: ''
        }
        
        // Add empty assistant message that will be updated
        addMessage(currentBookId.value, currentConversationId.value, assistantMessage)
        initializeConversations()
        
        await deepseekClient.streamChatCompletion(
          apiMessages,
          (chunk) => {
            assistantContent += chunk
            // Update the message content in real-time
            const conv = getConversation(currentBookId.value, currentConversationId.value)
            if (conv && conv.messages.length > 0) {
              conv.messages[conv.messages.length - 1].content = assistantContent
              initializeConversations()
            }
            
            // Call stream callback if provided
            if (options.onStream) {
              options.onStream(chunk)
            }
          },
          {
            temperature: options.temperature || 0.7,
            maxTokens: options.maxTokens || 2000
          }
        )
      } else {
        // Regular response
        const response = await deepseekClient.chatCompletion(apiMessages, {
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 2000
        })

        const assistantMessage = {
          role: 'assistant',
          content: response.choices[0].message.content
        }
        
        addMessage(currentBookId.value, currentConversationId.value, assistantMessage)
        initializeConversations()
      }

      return true
    } catch (err) {
      console.error('Failed to send message:', err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Prepare messages for API call
  const prepareMessagesForAPI = () => {
    // Simply return the messages as the full context is already in the system message
    return messages.value.map(m => ({
      role: m.role,
      content: m.content
    }))
  }

  // Switch to a different conversation
  const switchConversation = (conversationId) => {
    if (!currentBookId.value) return false
    
    const conversation = getConversation(currentBookId.value, conversationId)
    if (conversation) {
      currentConversationId.value = conversationId
      return true
    }
    return false
  }

  // Delete a conversation
  const deleteConversationById = (conversationId) => {
    if (!currentBookId.value) return false

    const success = deleteConversation(currentBookId.value, conversationId)
    if (success) {
      initializeConversations()
      
      // If we deleted the current conversation, switch to another or create new
      if (currentConversationId.value === conversationId) {
        const bookConvs = conversations.value[currentBookId.value] || []
        if (bookConvs.length > 0) {
          currentConversationId.value = bookConvs[0].id
        } else {
          startNewConversation()
        }
      }
    }
    return success
  }

  // Clear all conversations for current book
  const clearAllConversations = () => {
    if (!currentBookId.value) return false

    const success = clearBookConversations(currentBookId.value)
    if (success) {
      initializeConversations()
      startNewConversation()
    }
    return success
  }

  // Get conversation title suggestions based on first message
  const suggestConversationTitle = async (conversationId) => {
    const conversation = getConversation(currentBookId.value, conversationId)
    if (!conversation || conversation.messages.length < 2) return null

    try {
      const firstUserMessage = conversation.messages.find(m => m.role === 'user')
      if (!firstUserMessage) return null

      const response = await deepseekClient.chatCompletion([
        {
          role: 'system',
          content: 'Generate a short, descriptive title (max 50 characters) for this conversation based on the user\'s first message. Respond with only the title, no quotes or explanation.'
        },
        {
          role: 'user',
          content: firstUserMessage.content
        }
      ], {
        temperature: 0.5,
        maxTokens: 20
      })

      const title = response.choices[0].message.content.trim()
      if (title) {
        updateConversation(currentBookId.value, conversationId, { title })
        initializeConversations()
        return title
      }
    } catch (err) {
      console.error('Failed to generate title:', err)
    }
    return null
  }

  // Initialize on first use
  if (Object.keys(conversations.value).length === 0) {
    initializeConversations()
  }

  return {
    // State
    conversations: computed(() => conversations.value),
    currentBookConversations,
    currentConversation,
    messages,
    conversationCount,
    isLoading,
    error,
    currentBookId: computed(() => currentBookId.value),
    currentConversationId: computed(() => currentConversationId.value),

    // Methods
    setCurrentBook,
    setBookContext,
    extractBookContent,
    startNewConversation,
    sendMessage,
    switchConversation,
    deleteConversationById,
    clearAllConversations,
    suggestConversationTitle,
    initializeConversations,
    
    // State
    isExtractingContent,
    fullBookContent
  }
}