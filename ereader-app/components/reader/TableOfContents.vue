<template>
  <div class="table-of-contents">
    <div class="toc-header">
      <h2>Table of Contents</h2>
      <button @click="$emit('close')" class="close-btn">
        <Icon name="x" />
      </button>
    </div>
    
    <div class="toc-content">
      <div v-if="toc.length === 0" class="empty-toc">
        <Icon name="book-open" />
        <p>No table of contents available</p>
      </div>
      
      <nav v-else class="toc-nav">
        <TocItem
          v-for="(item, index) in toc"
          :key="index"
          :item="item"
          :current-chapter-index="currentChapterIndex"
          @navigate="handleNavigate"
        />
      </nav>
    </div>
  </div>
</template>

<script setup>
import Icon from '~/components/ui/Icon.vue'
import TocItem from '~/components/reader/TocItem.vue'

// Props
defineProps({
  toc: {
    type: Array,
    default: () => []
  },
  currentChapterIndex: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['close', 'navigate'])

// Methods
const handleNavigate = (href) => {
  emit('navigate', href)
  emit('close')
}
</script>

<style scoped>
.table-of-contents {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.toc-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: #e2e8f0;
  color: #64748b;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #cbd5e1;
  color: #475569;
}

.toc-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty-toc {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #64748b;
  text-align: center;
}

.empty-toc svg {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
}

.toc-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style> 