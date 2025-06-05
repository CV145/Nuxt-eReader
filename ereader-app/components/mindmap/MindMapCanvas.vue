<template>
  <div class="mind-map-canvas" ref="canvasContainer">
    <svg
      ref="svgCanvas"
      class="canvas-svg"
      :width="canvasWidth"
      :height="canvasHeight"
      @click="handleCanvasClick"
      @mousedown="handleCanvasMouseDown"
      @mousemove="handleCanvasMouseMove"
      @mouseup="handleCanvasMouseUp"
      @wheel="handleWheel"
    >
      <g :transform="`translate(${canvasOffset.x}, ${canvasOffset.y}) scale(${canvasScale})`">
        <!-- Grid Background -->
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" stroke-width="1" opacity="0.5"/>
          </pattern>
        </defs>
        <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" />
        
        <!-- Connections -->
        <g class="connections">
          <path
            v-for="(connection, index) in connections"
            :key="`connection-${index}`"
            :d="getConnectionPath(connection)"
            stroke="#94a3b8"
            stroke-width="2"
            fill="none"
            class="connection-line"
            @click="handleConnectionClick(connection, $event)"
          />
        </g>
        
        <!-- Nodes -->
        <g class="nodes">
          <g
            v-for="node in nodes.values()"
            :key="node.id"
            :transform="`translate(${node.x}, ${node.y})`"
            class="node-group"
            @mousedown="handleNodeMouseDown(node, $event)"
          >
            <rect
              :width="node.width"
              :height="node.height"
              :fill="node.color"
              :stroke="selectedNode?.id === node.id ? '#1e293b' : 'transparent'"
              stroke-width="2"
              rx="8"
              class="node-rect"
              opacity="0.9"
            />
            <foreignObject :width="node.width" :height="node.height">
              <div class="node-content">
                <input
                  v-if="editingNode?.id === node.id"
                  v-model="editingNode.title"
                  @blur="finishEditing"
                  @keyup.enter="finishEditing"
                  class="node-input"
                  :style="{ width: '100%' }"
                  ref="nodeInput"
                />
                <div v-else class="node-title" @dblclick="startEditing(node)">
                  {{ node.title }}
                </div>
                <Icon
                  v-if="node.linkedParagraph"
                  name="link"
                  class="link-indicator"
                  size="16"
                />
              </div>
            </foreignObject>
          </g>
        </g>
        
        <!-- Connection Preview -->
        <path
          v-if="connectionPreview"
          :d="connectionPreview"
          stroke="#3b82f6"
          stroke-width="2"
          stroke-dasharray="5,5"
          fill="none"
          pointer-events="none"
        />
      </g>
    </svg>
    
    <!-- Controls -->
    <div class="canvas-controls">
      <button @click="resetView" class="control-btn" title="Reset View">
        <Icon name="home" size="20" />
      </button>
      <button @click="zoomIn" class="control-btn" title="Zoom In">
        <Icon name="plus" size="20" />
      </button>
      <button @click="zoomOut" class="control-btn" title="Zoom Out">
        <Icon name="minus" size="20" />
      </button>
      <div class="zoom-level">{{ Math.round(canvasScale * 100) }}%</div>
    </div>
    
    <!-- Empty State -->
    <div v-if="nodes.size === 0" class="empty-state">
      <p>Click anywhere to create your first node</p>
      <p class="hint">Double-click nodes to edit • Drag to connect</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useMindMap } from '~/composables/useMindMap'
import Icon from '~/components/ui/Icon.vue'

const props = defineProps({
  chapterId: {
    type: String,
    required: true
  }
})

const {
  nodes,
  connections,
  selectedNode,
  canvasOffset,
  canvasScale,
  loadMindMap,
  createNode,
  updateNode,
  deleteNode,
  createConnection,
  deleteConnection,
  startDragging,
  updateNodePosition,
  stopDragging,
  panCanvas,
  zoomCanvas,
  resetView
} = useMindMap()

const canvasContainer = ref(null)
const svgCanvas = ref(null)
const canvasWidth = ref(800)
const canvasHeight = ref(600)
const isPanning = ref(false)
const isConnecting = ref(false)
const connectingFrom = ref(null)
const connectionPreview = ref(null)
const editingNode = ref(null)
const nodeInput = ref(null)
const lastMousePos = ref({ x: 0, y: 0 })

const updateCanvasSize = () => {
  if (canvasContainer.value) {
    canvasWidth.value = canvasContainer.value.clientWidth
    canvasHeight.value = canvasContainer.value.clientHeight
  }
}

const getMousePosition = (event) => {
  const rect = svgCanvas.value.getBoundingClientRect()
  return {
    x: (event.clientX - rect.left - canvasOffset.value.x) / canvasScale.value,
    y: (event.clientY - rect.top - canvasOffset.value.y) / canvasScale.value
  }
}

const handleCanvasClick = (event) => {
  if (event.target === svgCanvas.value || event.target.closest('.canvas-svg')) {
    const pos = getMousePosition(event)
    if (!isPanning.value && !isConnecting.value) {
      createNode(pos.x - 75, pos.y - 30)
    }
  }
}

const handleCanvasMouseDown = (event) => {
  if (event.target === svgCanvas.value) {
    isPanning.value = true
    lastMousePos.value = { x: event.clientX, y: event.clientY }
  }
}

const handleCanvasMouseMove = (event) => {
  if (isPanning.value) {
    const deltaX = event.clientX - lastMousePos.value.x
    const deltaY = event.clientY - lastMousePos.value.y
    panCanvas(deltaX, deltaY)
    lastMousePos.value = { x: event.clientX, y: event.clientY }
  } else if (isConnecting.value && connectingFrom.value) {
    const pos = getMousePosition(event)
    const fromNode = nodes.value.get(connectingFrom.value)
    if (fromNode) {
      connectionPreview.value = getPathBetweenPoints(
        fromNode.x + fromNode.width / 2,
        fromNode.y + fromNode.height / 2,
        pos.x,
        pos.y
      )
    }
  }
}

const handleCanvasMouseUp = () => {
  isPanning.value = false
  if (isConnecting.value) {
    isConnecting.value = false
    connectingFrom.value = null
    connectionPreview.value = null
  }
}

const handleNodeMouseDown = (node, event) => {
  event.stopPropagation()
  
  if (event.shiftKey) {
    if (connectingFrom.value && connectingFrom.value !== node.id) {
      createConnection(connectingFrom.value, node.id)
      isConnecting.value = false
      connectingFrom.value = null
      connectionPreview.value = null
    } else {
      isConnecting.value = true
      connectingFrom.value = node.id
    }
  } else {
    startDragging(node)
    const startX = event.clientX
    const startY = event.clientY
    const startNodeX = node.x
    const startNodeY = node.y
    
    const handleMouseMove = (e) => {
      const deltaX = (e.clientX - startX) / canvasScale.value
      const deltaY = (e.clientY - startY) / canvasScale.value
      updateNodePosition(node.id, startNodeX + deltaX, startNodeY + deltaY)
    }
    
    const handleMouseUp = () => {
      stopDragging()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
}

const handleConnectionClick = (connection, event) => {
  event.stopPropagation()
  if (confirm('Delete this connection?')) {
    deleteConnection(connection.from, connection.to)
  }
}

const handleWheel = (event) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  const rect = svgCanvas.value.getBoundingClientRect()
  const centerX = event.clientX - rect.left - canvasOffset.value.x
  const centerY = event.clientY - rect.top - canvasOffset.value.y
  zoomCanvas(delta, centerX, centerY)
}

const getConnectionPath = (connection) => {
  const fromNode = nodes.value.get(connection.from)
  const toNode = nodes.value.get(connection.to)
  
  if (!fromNode || !toNode) return ''
  
  return getPathBetweenPoints(
    fromNode.x + fromNode.width / 2,
    fromNode.y + fromNode.height / 2,
    toNode.x + toNode.width / 2,
    toNode.y + toNode.height / 2
  )
}

const getPathBetweenPoints = (x1, y1, x2, y2) => {
  const dx = x2 - x1
  const dy = y2 - y1
  const cx = x1 + dx / 2
  const cy = y1 + dy / 2
  
  return `M ${x1} ${y1} Q ${cx} ${y1}, ${cx} ${cy} T ${x2} ${y2}`
}

const startEditing = (node) => {
  editingNode.value = { ...node }
  nextTick(() => {
    if (nodeInput.value) {
      nodeInput.value[0]?.focus()
      nodeInput.value[0]?.select()
    }
  })
}

const finishEditing = () => {
  if (editingNode.value) {
    updateNode(editingNode.value.id, { title: editingNode.value.title })
    editingNode.value = null
  }
}

const zoomIn = () => zoomCanvas(0.1)
const zoomOut = () => zoomCanvas(-0.1)

const handleKeyDown = (event) => {
  if (selectedNode.value && event.key === 'Delete') {
    deleteNode(selectedNode.value.id)
  }
}

watch(() => props.chapterId, (newId) => {
  if (newId) {
    loadMindMap(newId)
  }
}, { immediate: true })

onMounted(() => {
  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCanvasSize)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.mind-map-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  overflow: hidden;
}

.canvas-svg {
  cursor: crosshair;
  user-select: none;
}

.node-group {
  cursor: move;
}

.node-rect {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  transition: all 0.2s ease;
}

.node-rect:hover {
  filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.15));
}

.node-content {
  padding: 12px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.node-title {
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 100%;
}

.node-input {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  text-align: center;
  color: #1e293b;
}

.link-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  color: white;
  opacity: 0.8;
}

.connection-line {
  cursor: pointer;
  transition: stroke 0.2s ease;
}

.connection-line:hover {
  stroke: #ef4444;
  stroke-width: 3;
}

.canvas-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 8px;
}

.control-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.zoom-level {
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
}

.empty-state p {
  margin: 8px 0;
}

.empty-state .hint {
  font-size: 14px;
  opacity: 0.8;
}
</style>