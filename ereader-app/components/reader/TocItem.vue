<template>
  <div class="toc-item">
    <button
      @click="handleClick"
      class="toc-link"
      :class="{ active: isActive }"
    >
      <span class="toc-label">{{ item.label }}</span>
      <Icon 
        v-if="hasChildren" 
        name="chevron-right" 
        class="expand-icon"
        :class="{ expanded: isExpanded }"
      />
    </button>
    
    <div v-if="hasChildren && isExpanded" class="toc-children">
      <TocItem
        v-for="(child, index) in item.children"
        :key="index"
        :item="child"
        :current-chapter-index="currentChapterIndex"
        :level="level + 1"
        @navigate="emit('navigate', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Icon from '~/components/ui/Icon.vue'

// Props
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  currentChapterIndex: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['navigate'])

// State
const isExpanded = ref(false)

// Computed
const hasChildren = computed(() => 
  props.item.children && props.item.children.length > 0
)

const isActive = computed(() => {
  // This is a simplified check - in a real implementation,
  // you'd want to match the href with the current chapter
  return false
})

// Methods
const handleClick = () => {
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value
  } else {
    emit('navigate', props.item.href)
  }
}
</script>

<style scoped>
.toc-item {
  margin-bottom: 0.25rem;
}

.toc-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  color: #374151;
}

.toc-link:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.toc-link.active {
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 500;
}

.toc-label {
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.4;
}

.expand-icon {
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.toc-children {
  margin-left: 1rem;
  border-left: 1px solid #e5e7eb;
  padding-left: 0.5rem;
}

/* Nested levels */
.toc-item .toc-item .toc-link {
  padding-left: 1.5rem;
  font-size: 0.8125rem;
}

.toc-item .toc-item .toc-item .toc-link {
  padding-left: 2rem;
  font-size: 0.75rem;
}
</style> 