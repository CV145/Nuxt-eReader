<template>
  <div class="mind-map-sidebar">
    <div class="sidebar-header">
      <h3>Mind Map</h3>
      <div class="header-controls">
        <button @click="$emit('close')" class="close-btn">
          <Icon name="x" size="20" />
        </button>
      </div>
    </div>
    
    <div class="sidebar-content">
      <MindMapCanvas
        v-if="chapterId"
        :chapter-id="chapterId"
      />
      <div v-else class="no-chapter">
        <p>Select a chapter to start creating a mind map</p>
      </div>
    </div>
    
    <div class="sidebar-footer">
      <div class="node-palette">
        <div
          v-for="color in nodeColors"
          :key="color"
          :style="{ background: color }"
          class="color-swatch"
          @click="setNodeColor(color)"
          :class="{ active: selectedColor === color }"
        />
      </div>
      <div class="footer-actions">
        <button @click="exportMindMap" class="action-btn">
          <Icon name="download" size="16" />
          Export
        </button>
        <button @click="clearMindMap" class="action-btn danger">
          <Icon name="trash-2" size="16" />
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMindMap } from '~/composables/useMindMap'
import MindMapCanvas from './MindMapCanvas.vue'
import Icon from '~/components/ui/Icon.vue'

const props = defineProps({
  chapterId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close'])

const {
  nodes,
  selectedNode,
  updateNode,
  saveMindMap
} = useMindMap()

const nodeColors = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#64748B'  // gray
]

const selectedColor = ref('#3B82F6')

const setNodeColor = (color) => {
  selectedColor.value = color
  if (selectedNode.value) {
    updateNode(selectedNode.value.id, { color })
  }
}

const exportMindMap = () => {
  const canvas = document.querySelector('.canvas-svg')
  if (!canvas) return
  
  const svgData = new XMLSerializer().serializeToString(canvas)
  const blob = new Blob([svgData], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `mindmap-${props.chapterId || 'export'}.svg`
  a.click()
  
  URL.revokeObjectURL(url)
}

const clearMindMap = () => {
  if (confirm('Are you sure you want to clear this mind map?')) {
    nodes.value.clear()
    saveMindMap()
  }
}
</script>

<style scoped>
.mind-map-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sidebar-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.no-chapter {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 20px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.node-palette {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  justify-content: center;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.active {
  border-color: white;
  transform: scale(1.1);
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}
</style>