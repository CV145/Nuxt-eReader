<template>
  <div class="file-upload">
    <div 
      class="upload-area"
      :class="{ 
        'drag-over': isDragOver,
        'has-file': selectedFile
      }"
      @drop="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".epub"
        @change="handleFileSelect"
        class="file-input"
      />
      
      <div class="upload-content">
        <div v-if="!selectedFile" class="upload-prompt">
          <Icon name="upload" class="upload-icon" />
          <h3>Upload EPUB File</h3>
          <p>Drag and drop an EPUB file here, or click to browse</p>
          <span class="file-types">Supported: .epub files</span>
        </div>
        
        <div v-else class="file-selected">
          <Icon name="file-text" class="file-icon" />
          <div class="file-info">
            <h4>{{ selectedFile.name }}</h4>
            <p>{{ formatFileSize(selectedFile.size) }}</p>
          </div>
          <button @click.stop="clearFile" class="clear-btn">
            <Icon name="x" />
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="selectedFile" class="upload-actions">
      <button @click="loadFile" :disabled="isLoading" class="load-btn">
        <span v-if="isLoading" class="loading-spinner"></span>
        {{ isLoading ? 'Loading...' : 'Load Book' }}
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      <Icon name="alert-circle" />
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Icon from '~/components/ui/Icon.vue'

// Props
defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['fileSelected', 'loadFile'])

// State
const fileInput = ref(null)
const selectedFile = ref(null)
const isDragOver = ref(false)

// Methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && (file.type === 'application/epub+zip' || file.name.endsWith('.epub'))) {
    selectedFile.value = file
    emit('fileSelected', file)
  } else {
    alert('Please select a valid EPUB file')
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    if (file.type === 'application/epub+zip' || file.name.endsWith('.epub')) {
      selectedFile.value = file
      emit('fileSelected', file)
    } else {
      alert('Please select a valid EPUB file')
    }
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const loadFile = () => {
  if (selectedFile.value) {
    emit('loadFile', selectedFile.value)
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.file-upload {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.upload-area:hover {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.2);
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.02);
}

.upload-area.has-file {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: white;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  color: rgba(255, 255, 255, 0.8);
}

.upload-prompt h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.upload-prompt p {
  margin: 0;
  opacity: 0.9;
}

.file-types {
  font-size: 0.875rem;
  opacity: 0.7;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.file-icon {
  width: 2rem;
  height: 2rem;
  color: #10b981;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-info h4 {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0;
  word-break: break-all;
}

.file-info p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.clear-btn:hover {
  background: #fecaca;
}

.upload-actions {
  margin-top: 1rem;
  text-align: center;
}

.load-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.load-btn:hover:not(:disabled) {
  background: #2563eb;
}

.load-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  backdrop-filter: blur(10px);
}

/* Responsive design */
@media (max-width: 640px) {
  .upload-area {
    padding: 1.5rem 1rem;
  }
  
  .file-selected {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .file-info {
    text-align: center;
  }
}
</style> 