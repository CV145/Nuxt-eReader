<template>
  <aside class="notebook-sidebar" v-if="isOpen" :class="{ 'side-by-side': sideBySize }">
    <header>
      <h3>Notebook</h3>
      <div class="header-actions">
        <button class="export-btn" @click="exportToGoogleDocs" title="Export to Google Docs">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
        </button>
        <button class="close" @click="$emit('close')" v-if="!sideBySize">×</button>
      </div>
    </header>

    <div class="notebook-editor">
      <textarea 
        v-model="documentContent" 
        class="document-textarea" 
        placeholder="Start writing or add text from the book..."
        @input="saveChanges"
        @keydown="handleKeydown"
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
  isOpen: { type: Boolean, default: false },
  sideBySize: { type: Boolean, default: false }
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

// Prevent spacebar from propagating to parent (focus mode)
const handleKeydown = (event) => {
  if (event.key === ' ') {
    event.stopPropagation();
  }
}

// Export to Google Docs
const exportToGoogleDocs = () => {
  const content = documentContent.value;
  if (!content.trim()) {
    alert('Notebook is empty. Nothing to export.');
    return;
  }
  
  // Create a data URL with the content
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const a = document.createElement('a');
  a.href = url;
  a.download = `notebook-${props.bookId}.txt`;
  a.click();
  
  URL.revokeObjectURL(url);
  
  // Show instructions for Google Docs
  setTimeout(() => {
    alert('File downloaded! To import to Google Docs:\n\n1. Go to docs.google.com\n2. Click "Blank" to create a new document\n3. Go to File > Open\n4. Click "Upload" tab\n5. Select the downloaded .txt file\n\nNote: You can also copy the text directly from the notebook and paste it into Google Docs.');
  }, 500);
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

.notebook-sidebar.side-by-side {
  position: relative;
  width: 100%;
  height: 100%;
  border-left: none;
  box-shadow: none;
  border-left: 1px solid #e5e7eb;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.export-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.export-btn:hover {
  background: #2563eb;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  color: #6b7280;
}

.close:hover {
  color: #374151;
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
