<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-container">
      <header>
        <h3>Add Note</h3>
        <button @click="$emit('cancel')" class="close-btn">×</button>
      </header>

      <div class="modal-content">
        <div class="source-info" v-if="sourceText">
          <p class="label">Selected text:</p>
          <div class="selected-text">{{ sourceText }}</div>
          <p class="context">From {{ chapterTitle }}, paragraph {{ paragraphNumber || 'unknown' }}</p>
        </div>

        <div class="form-group">
          <label for="note-text">Your note:</label>
          <textarea 
            id="note-text" 
            v-model="noteText" 
            placeholder="Write your note here..." 
            rows="5"
            @keydown.ctrl.enter="saveNote"
            @keydown.meta.enter="saveNote"
            ref="noteInput"
          ></textarea>
        </div>
        
        <p class="hint">Press Ctrl+Enter or ⌘+Enter to save</p>
      </div>

      <footer>
        <button @click="$emit('cancel')" class="btn-cancel">Cancel</button>
        <button @click="saveNote" class="btn-save">
          Add to Notebook
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  show: Boolean,
  sourceText: String,
  chapterTitle: String, 
  paragraphNumber: Number
})

const emit = defineEmits(['save', 'cancel'])
const noteText = ref('')
const noteInput = ref(null)

// Focus the textarea when modal opens
watch(() => props.show, async (isShown) => {
  if (isShown) {
    // Prefill with a newline to encourage typing; or leave empty
    noteText.value = props.sourceText || ''
    await nextTick()
    noteInput.value?.focus()
  }
})

function saveNote() {
  // noteText can be empty, we'll still pass it along
  emit('save', noteText.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.modal-container {
  width: 95%;
  max-width: 550px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

header h3 {
  margin: 0;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  color: #6b7280;
}

.modal-content {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
}

.source-info {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.label {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 0.25rem 0;
}

.selected-text {
  font-style: italic;
  color: #4b5563;
  white-space: pre-wrap;
  margin: 0.5rem 0;
}

.context {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.25rem 0 0;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #111827;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}

.hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.25rem 0 0;
  text-align: right;
}

footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  gap: 0.5rem;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-save {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-save:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}
</style>
