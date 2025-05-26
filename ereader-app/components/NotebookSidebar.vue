<template>
  <aside class="notebook-sidebar" v-if="isOpen">
    <header>
      <h3>Notebook</h3>
      <button class="close" @click="$emit('close')">×</button>
    </header>

    <div class="notebook-editor">
      <textarea 
        v-model="documentContent" 
        class="document-textarea" 
        placeholder="Start writing or add text from the book..."
        @input="saveChanges"
      ></textarea>
      <div v-if="!documentContent" class="empty">
        <p>Your notebook is empty. Start typing or select text in the book to add it.</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useNotebook } from '~/composables/useNotebook'

const props = defineProps({
  bookId: { type: String, required: true },
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const { getNotebookContent, updateNotebookContent } = useNotebook()
const documentContent = ref('')

// Initialize the content immediately
const initContent = () => {
  // Get the content directly to ensure we have the latest
  documentContent.value = getNotebookContent(props.bookId)
}

// Update content when bookId changes or component mounts
watch(() => props.bookId, initContent, { immediate: true })

// Also refresh content when the sidebar is opened
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    initContent()
  }
})

// Save changes when user types
const saveChanges = () => {
  updateNotebookContent(props.bookId, documentContent.value)
}
</script>

<style scoped>
.notebook-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  box-shadow: -2px 0 4px rgba(0,0,0,0.05);
  padding: 1rem;
  overflow-y: auto;
  z-index: 1100;
  display: flex;
  flex-direction: column;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.notebook-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.document-textarea {
  flex: 1;
  min-height: calc(100vh - 100px);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 0.95rem;
  line-height: 1.6;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: #f9fafb;
  resize: none;
  white-space: pre-wrap;
}

.empty {
  margin-top: 2rem;
  color: #9ca3af;
  font-size: 0.875rem;
  text-align: center;
}
</style>
