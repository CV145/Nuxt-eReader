<template>
  <Transition name="sidebar">
    <aside v-if="isOpen" class="ai-chat-sidebar">
      <div class="sidebar-header">
        <div class="header-left">
          <h2 class="sidebar-title">
            <Icon name="message-circle" :size="24" />
            AI Assistant
          </h2>
          <button
            @click="showConversations = !showConversations"
            class="conversations-toggle"
            :title="`${conversationCount} conversation${conversationCount !== 1 ? 's' : ''}`"
          >
            <Icon name="list" :size="18" />
            <span class="conversation-count">{{ conversationCount }}</span>
          </button>
        </div>
        <div class="header-actions">
          <button @click="startNewChat" class="action-btn" title="New conversation">
            <Icon name="plus" :size="20" />
          </button>
          <button @click="$emit('close')" class="close-btn">
            <Icon name="x" :size="24" />
          </button>
        </div>
      </div>

      <!-- Conversations List -->
      <Transition name="slide-down">
        <div v-if="showConversations" class="conversations-list">
          <div
            v-for="conv in conversations"
            :key="conv.id"
            class="conversation-item"
            :class="{ active: conv.id === currentConversationId }"
            @click="switchToConversation(conv.id)"
          >
            <div class="conversation-info">
              <div class="conversation-title">{{ conv.title }}</div>
              <div class="conversation-meta">
                {{ formatDate(conv.updatedAt) }} · {{ conv.messages.length }} messages
              </div>
            </div>
            <button
              @click.stop="deleteConversationHandler(conv.id)"
              class="delete-btn"
              title="Delete conversation"
            >
              <Icon name="trash" :size="16" />
            </button>
          </div>
        </div>
      </Transition>

      <!-- Chat Messages -->
      <div ref="messagesContainer" class="chat-messages">
        <!-- Book content extraction indicator -->
        <div v-if="isExtractingContent" class="extraction-indicator">
          <div class="loading-spinner"></div>
          <p>Analyzing book content for enhanced AI assistance...</p>
          <small>This only needs to happen once per book</small>
        </div>

        <div v-else-if="messages.length === 0" class="empty-state">
          <Icon name="message-circle" :size="48" />
          <h3>Start a conversation</h3>
          <p>Ask anything about the book, characters, themes, or plot!</p>
          <div class="starter-questions">
            <button
              v-for="question in starterQuestions"
              :key="question"
              @click="sendStarterQuestion(question)"
              class="starter-btn"
            >
              {{ question }}
            </button>
          </div>
        </div>

        <div v-else class="messages-list">
          <div
            v-for="message in visibleMessages"
            :key="message.id"
            class="message"
            :class="`message-${message.role}`"
          >
            <div class="message-avatar">
              <Icon
                :name="message.role === 'user' ? 'user' : 'bot'"
                :size="20"
              />
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="message message-assistant loading">
          <div class="message-avatar">
            <Icon name="bot" :size="20" />
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chat-input-container">
        <div v-if="error" class="error-message">
          <Icon name="alert-circle" :size="16" />
          {{ error }}
        </div>
        <form @submit.prevent="sendMessage" class="chat-input-form">
          <textarea
            v-model="inputMessage"
            @keydown.enter.prevent="handleEnterKey"
            :disabled="isLoading"
            placeholder="Ask about the book..."
            class="chat-input"
            rows="1"
            ref="chatInput"
          ></textarea>
          <button
            type="submit"
            :disabled="!inputMessage.trim() || isLoading"
            class="send-btn"
          >
            <Icon name="send" :size="20" />
          </button>
        </form>
        <div class="input-hint">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </aside>
  </Transition>

  <!-- Backdrop -->
  <Transition name="fade">
    <div v-if="isOpen" class="sidebar-backdrop" @click="$emit('close')"></div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useAIChat } from '~/composables/useAIChat'
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
  },
  bookContext: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['close'])

// AI Chat composable
const {
  currentBookConversations,
  currentConversation,
  messages,
  conversationCount,
  isLoading,
  error,
  currentConversationId,
  setCurrentBook,
  setBookContext,
  extractBookContent,
  startNewConversation,
  sendMessage: sendAIMessage,
  switchConversation,
  deleteConversationById,
  fullBookContent,
  isExtractingContent
} = useAIChat()

// Local state
const inputMessage = ref('')
const showConversations = ref(false)
const messagesContainer = ref(null)
const chatInput = ref(null)

// Computed
const conversations = computed(() => currentBookConversations.value)

const visibleMessages = computed(() => {
  // Filter out system messages for display
  return messages.value.filter(m => m.role !== 'system')
})

const starterQuestions = computed(() => {
  const bookTitle = props.bookContext?.title || 'this book'
  return [
    `What are the main themes in ${bookTitle}?`,
    'Who are the main characters?',
    'Can you summarize what has happened so far?',
    'What should I pay attention to while reading?'
  ]
})

// Methods
const sendMessage = async () => {
  const message = inputMessage.value.trim()
  if (!message || isLoading.value) return

  inputMessage.value = ''
  
  // Include current chapter context if available
  const options = {
    includeContext: true,
    stream: true,
    onStream: () => {
      // Scroll to bottom as content streams in
      scrollToBottom()
    }
  }

  await sendAIMessage(message, options)
  scrollToBottom()
}

const sendStarterQuestion = (question) => {
  inputMessage.value = question
  sendMessage()
}

const handleEnterKey = (event) => {
  if (!event.shiftKey) {
    sendMessage()
  } else {
    // Allow new line with Shift+Enter
    inputMessage.value += '\n'
  }
}

const startNewChat = () => {
  startNewConversation()
  showConversations.value = false
}

const switchToConversation = (conversationId) => {
  switchConversation(conversationId)
  showConversations.value = false
  scrollToBottom()
}

const deleteConversationHandler = (conversationId) => {
  if (confirm('Delete this conversation?')) {
    deleteConversationById(conversationId)
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatMessage = (content) => {
  // Convert markdown-like formatting to HTML
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString()
}

// Auto-resize textarea
watch(inputMessage, () => {
  if (chatInput.value) {
    chatInput.value.style.height = 'auto'
    chatInput.value.style.height = Math.min(chatInput.value.scrollHeight, 120) + 'px'
  }
})

// Initialize when opened
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    setCurrentBook(props.bookId, props.bookContext)
    setBookContext(props.bookContext)
    
    // Extract full book content if available and not already extracted
    if (props.bookContext?.parser && !fullBookContent.value) {
      await extractBookContent(props.bookContext.parser)
    }
    
    nextTick(() => {
      scrollToBottom()
      if (chatInput.value) {
        chatInput.value.focus()
      }
    })
  }
})

// Update context when it changes
watch(() => props.bookContext, (newContext) => {
  if (props.isOpen) {
    setBookContext(newContext)
  }
}, { deep: true })

// Initialize on mount if open
onMounted(() => {
  if (props.isOpen) {
    setCurrentBook(props.bookId, props.bookContext)
  }
})
</script>

<style scoped>
.ai-chat-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
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

/* Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--primary-gradient);
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.conversations-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-base);
}

.conversations-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
}

.conversation-count {
  background: white;
  color: var(--primary-color);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 0.75rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn,
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

.action-btn:hover,
.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

/* Conversations List */
.conversations-list {
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  max-height: 200px;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all var(--transition-base);
  border-bottom: 1px solid var(--border-color);
}

.conversation-item:hover {
  background: var(--bg-secondary);
}

.conversation-item.active {
  background: var(--primary-light);
  color: white;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-title {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-meta {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.125rem;
}

.delete-btn {
  background: transparent;
  border: none;
  color: inherit;
  opacity: 0.5;
  padding: 0.25rem;
  cursor: pointer;
  transition: all var(--transition-base);
}

.delete-btn:hover {
  opacity: 1;
  color: #ef4444;
}

/* Chat Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: var(--bg-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  height: 100%;
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
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
}

.starter-questions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 300px;
}

.starter-btn {
  background: white;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-base);
}

.starter-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

/* Messages */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  gap: 0.75rem;
  animation: messageSlide 0.3s ease-out;
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-user .message-avatar {
  background: var(--primary-gradient);
  color: white;
}

.message-assistant .message-avatar {
  background: var(--secondary-gradient);
  color: white;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-text {
  background: white;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  line-height: 1.5;
  word-wrap: break-word;
}

.message-text code {
  background: var(--bg-tertiary);
  padding: 0.125rem 0.25rem;
  border-radius: var(--radius-sm);
  font-family: monospace;
  font-size: 0.875em;
}

.message-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  padding: 0 0.5rem;
}

/* Loading state */
.message.loading .message-text {
  background: transparent;
  padding: 0;
}

/* Book extraction indicator */
.extraction-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  height: 100%;
}

.extraction-indicator .loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.extraction-indicator p {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.extraction-indicator small {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.typing-indicator {
  display: flex;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--text-secondary);
  border-radius: var(--radius-full);
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* Chat Input */
.chat-input-container {
  border-top: 1px solid var(--border-color);
  background: white;
  padding: 1rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-md);
}

.chat-input-form {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  resize: none;
  transition: all var(--transition-base);
  max-height: 120px;
}

.chat-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: white;
}

.chat-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn {
  background: var(--primary-gradient);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-hint {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  text-align: center;
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--transition-base);
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Mobile */
@media (max-width: 768px) {
  .ai-chat-sidebar {
    width: 100%;
  }
  
  .starter-questions {
    max-width: none;
  }
}
</style>