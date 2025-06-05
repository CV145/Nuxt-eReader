import { ref, computed, watch } from 'vue'

export const useMindMap = () => {
  const nodes = ref(new Map())
  const connections = ref([])
  const selectedNode = ref(null)
  const draggedNode = ref(null)
  const canvasOffset = ref({ x: 0, y: 0 })
  const canvasScale = ref(1)
  const mindMaps = ref({})
  const currentChapterId = ref(null)

  const currentMindMap = computed(() => {
    if (!currentChapterId.value) return { nodes: new Map(), connections: [] }
    return mindMaps.value[currentChapterId.value] || { nodes: new Map(), connections: [] }
  })

  const loadMindMap = (chapterId) => {
    currentChapterId.value = chapterId
    const savedData = localStorage.getItem(`mindmap_${chapterId}`)
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        nodes.value = new Map(parsed.nodes)
        connections.value = parsed.connections || []
      } catch (e) {
        console.error('Failed to load mind map:', e)
        nodes.value = new Map()
        connections.value = []
      }
    } else {
      nodes.value = new Map()
      connections.value = []
    }
  }

  const saveMindMap = () => {
    if (!currentChapterId.value) return
    
    const data = {
      nodes: Array.from(nodes.value.entries()),
      connections: connections.value
    }
    
    localStorage.setItem(`mindmap_${currentChapterId.value}`, JSON.stringify(data))
  }

  const createNode = (x, y, title = 'New Node') => {
    const id = Date.now().toString()
    const node = {
      id,
      x,
      y,
      title,
      description: '',
      color: '#3B82F6',
      type: 'default',
      width: 150,
      height: 60,
      linkedParagraph: null
    }
    
    nodes.value.set(id, node)
    saveMindMap()
    return node
  }

  const updateNode = (id, updates) => {
    const node = nodes.value.get(id)
    if (node) {
      Object.assign(node, updates)
      nodes.value.set(id, node)
      saveMindMap()
    }
  }

  const deleteNode = (id) => {
    nodes.value.delete(id)
    connections.value = connections.value.filter(
      conn => conn.from !== id && conn.to !== id
    )
    if (selectedNode.value?.id === id) {
      selectedNode.value = null
    }
    saveMindMap()
  }

  const createConnection = (fromId, toId) => {
    const exists = connections.value.some(
      conn => (conn.from === fromId && conn.to === toId) ||
              (conn.from === toId && conn.to === fromId)
    )
    
    if (!exists) {
      connections.value.push({ from: fromId, to: toId })
      saveMindMap()
    }
  }

  const deleteConnection = (fromId, toId) => {
    connections.value = connections.value.filter(
      conn => !(conn.from === fromId && conn.to === toId) &&
              !(conn.from === toId && conn.to === fromId)
    )
    saveMindMap()
  }

  const startDragging = (node) => {
    draggedNode.value = node
    selectedNode.value = node
  }

  const updateNodePosition = (id, x, y) => {
    const node = nodes.value.get(id)
    if (node) {
      node.x = x
      node.y = y
      nodes.value.set(id, node)
    }
  }

  const stopDragging = () => {
    if (draggedNode.value) {
      saveMindMap()
      draggedNode.value = null
    }
  }

  const panCanvas = (deltaX, deltaY) => {
    canvasOffset.value.x += deltaX
    canvasOffset.value.y += deltaY
  }

  const zoomCanvas = (delta, centerX = 0, centerY = 0) => {
    const oldScale = canvasScale.value
    const newScale = Math.max(0.1, Math.min(3, oldScale + delta))
    
    const scaleDiff = newScale - oldScale
    canvasOffset.value.x -= centerX * scaleDiff
    canvasOffset.value.y -= centerY * scaleDiff
    
    canvasScale.value = newScale
  }

  const resetView = () => {
    canvasOffset.value = { x: 0, y: 0 }
    canvasScale.value = 1
  }

  const linkNodeToParagraph = (nodeId, paragraphNumber) => {
    const node = nodes.value.get(nodeId)
    if (node) {
      node.linkedParagraph = paragraphNumber
      nodes.value.set(nodeId, node)
      saveMindMap()
    }
  }

  const getNodeByParagraph = (paragraphNumber) => {
    return Array.from(nodes.value.values()).find(
      node => node.linkedParagraph === paragraphNumber
    )
  }

  watch(nodes, () => {
    if (nodes.value.size > 0) {
      saveMindMap()
    }
  }, { deep: true })

  return {
    nodes,
    connections,
    selectedNode,
    draggedNode,
    canvasOffset,
    canvasScale,
    currentChapterId,
    currentMindMap,
    loadMindMap,
    saveMindMap,
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
    resetView,
    linkNodeToParagraph,
    getNodeByParagraph
  }
}