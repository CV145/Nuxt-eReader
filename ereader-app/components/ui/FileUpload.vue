<template>
  <div class="file-upload">
    <div 
      class="upload-area"
      :class="{ 
        'drag-over': isDragOver, 
        'has-file': selectedFile,
        'is-loading': isLoading 
      }"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @click="$refs.fileInput.click()"
    >
      <!-- Upload Icon Animation -->
      <div class="upload-icon-wrapper">
        <div class="upload-icon-bg"></div>
        <Icon name="upload" :size="48" class="upload-icon" />
      </div>
      
      <!-- Upload Content -->
      <div v-if="!selectedFile" class="upload-content">
        <h3 class="upload-title">Drop your EPUB here</h3>
        <p class="upload-subtitle">or click to browse</p>
        <div class="upload-hint">
          <Icon name="file-text" :size="16" />
          Supports .epub files up to 50MB
        </div>
      </div>
      
      <!-- Selected File -->
      <div v-else class="file-info">
        <div class="file-icon">
          <Icon name="book" :size="32" />
        </div>
        <div class="file-details">
          <h4 class="file-name">{{ selectedFile.name }}</h4>
          <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
        </div>
        <button 
          @click.stop="clearFile" 
          class="btn-clear"
          :disabled="isLoading"
        >
          <Icon name="x" :size="20" />
        </button>
      </div>
      
      <input
        ref="fileInput"
        type="file"
        accept=".epub,application/epub+zip"
        @change="handleFileChange"
        class="hidden-input"
      />
    </div>
    
    <!-- Error Message -->
    <transition name="slide-up">
      <div v-if="error || validationError" class="error-message">
        <Icon name="alert-circle" :size="16" />
        {{ error || validationError }}
      </div>
    </transition>
    
    <!-- Action Button -->
    <button 
      v-if="selectedFile"
      @click="loadFile"
      :disabled="isLoading || !!validationError"
      class="btn-load hover-lift"
      :class="{ loading: isLoading }"
    >
      <div v-if="isLoading" class="loading-spinner"></div>
      <Icon v-else name="book-open" :size="20" />
      {{ isLoading ? 'Loading...' : 'Load Book' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Icon from './Icon.vue'

// Props
const props = defineProps({
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
const selectedFile = ref(null)
const isDragOver = ref(false)
const validationError = ref(null)

// Methods
const handleDrop = (event) => {
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    validateAndSelectFile(files[0])
  }
}

const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleFileChange = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    validateAndSelectFile(files[0])
  }
}

const validateAndSelectFile = (file) => {
  validationError.value = null
  
  // Check file type
  if (!file.name.toLowerCase().endsWith('.epub') && 
      file.type !== 'application/epub+zip') {
    validationError.value = 'Please select a valid EPUB file'
    return
  }
  
  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    validationError.value = 'File size must be less than 50MB'
    return
  }
  
  selectedFile.value = file
  emit('fileSelected', file)
}

const clearFile = () => {
  selectedFile.value = null
  validationError.value = null
  emit('fileSelected', null)
}

const loadFile = () => {
  if (selectedFile.value && !validationError.value) {
    emit('loadFile', selectedFile.value)
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
.file-upload {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

/* Upload Area */
.upload-area {
  background: var(--bg-tertiary);
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-xl);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: var(--primary-color);
  background: var(--bg-secondary);
}

.upload-area.drag-over {
  border-color: var(--primary-color);
  background: var(--primary-light);
  background: rgba(99, 102, 241, 0.05);
  transform: scale(1.02);
}

.upload-area.has-file {
  padding: 1.5rem;
  cursor: default;
}

.upload-area.is-loading {
  pointer-events: none;
  opacity: 0.7;
}

/* Upload Icon */
.upload-icon-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
}

.upload-icon-bg {
  position: absolute;
  inset: 0;
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
  opacity: 0.1;
  animation: pulse 2s ease-in-out infinite;
}

.upload-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--primary-color);
  transition: transform var(--transition-base);
}

.upload-area:hover .upload-icon {
  transform: translate(-50%, -50%) translateY(-4px);
}

.upload-area.drag-over .upload-icon {
  transform: translate(-50%, -50%) scale(1.1);
}

/* Upload Content */
.upload-content {
  animation: fadeIn 0.3s ease-out;
}

.upload-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.upload-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 1.5rem 0;
}

.upload-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border-radius: var(--radius-full);
}

/* File Info */
.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  animation: scaleIn 0.3s ease-out;
}

.file-icon {
  width: 48px;
  height: 48px;
  background: var(--primary-gradient);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.file-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.btn-clear {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 0.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-clear:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-clear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Hidden Input */
.hidden-input {
  position: absolute;
  left: -9999px;
  opacity: 0;
}

/* Error Message */
.error-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-lg);
  color: #dc2626;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message svg {
  flex-shrink: 0;
}

/* Load Button */
.btn-load {
  width: 100%;
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.btn-load:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-load:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-load.loading {
  color: transparent;
}

.loading-spinner {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all var(--transition-base);
}

.slide-up-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .upload-area {
    padding: 2rem 1.5rem;
  }
  
  .upload-area.has-file {
    padding: 1rem;
  }
  
  .upload-title {
    font-size: 1.25rem;
  }
  
  .file-info {
    gap: 0.75rem;
  }
  
  .file-icon {
    width: 40px;
    height: 40px;
  }
}
</style>