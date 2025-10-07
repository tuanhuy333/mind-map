import { useCallback, useMemo, useState, useEffect } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import './MindMapVisualization.css'

function MindMapVisualization({ structure, onNodeClick, activeNode }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [collapsedNodes, setCollapsedNodes] = useState(new Set())

  // Convert structure to React Flow nodes and edges
  const { flowNodes, flowEdges } = useMemo(() => {
    if (!structure || !structure.children || structure.children.length === 0) {
      return { flowNodes: [], flowEdges: [] }
    }

    const nodes = []
    const edges = []
    let nodeId = 0

    // Create a cleaner tree layout
    const createTreeNodes = (parentNode, children, level = 1, startX = 400, startY = 50) => {
      if (!children || children.length === 0) return

      const nodeWidth = 180
      const nodeHeight = 50
      const verticalSpacing = 100
      const horizontalSpacing = 250

      // Calculate total width needed for this level
      const totalWidth = (children.length - 1) * horizontalSpacing
      const startXAdjusted = startX - totalWidth / 2

      children.forEach((child, index) => {
        nodeId++
        
        const childX = startXAdjusted + index * horizontalSpacing
        const childY = startY + verticalSpacing

         const node = {
           id: `node-${nodeId}`,
           type: 'default',
           position: { x: childX, y: childY },
           data: {
             label: child.text || 'Untitled',
             level: level,
             originalData: child,
             isCollapsed: collapsedNodes.has(child.id)
           },
           style: {
             background: level === 1 ? '#e3f2fd' : level === 2 ? '#f3e5f5' : '#f1f8e9',
             color: level === 1 ? '#1976d2' : level === 2 ? '#7b1fa2' : '#388e3c',
             border: activeNode && child.id === activeNode.id ? '3px solid #ff5722' : '2px solid #e0e0e0',
             borderRadius: '8px',
             fontSize: level === 1 ? '14px' : level === 2 ? '13px' : '12px',
             fontWeight: level <= 2 ? '600' : '500',
             width: nodeWidth,
             height: nodeHeight,
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             cursor: 'pointer'
           }
         }

        // Highlight active node
        if (activeNode && child.id === activeNode.id) {
          node.style.background = '#fff3e0'
          node.style.border = '3px solid #ff5722'
          node.style.boxShadow = '0 4px 16px rgba(255,87,34,0.3)'
        }

        nodes.push(node)

         // Create edge only for direct parent-child relationship (skip virtual root)
         if (parentNode.id !== 'virtual-root') {
           const edge = {
             id: `edge-${parentNode.id}-${node.id}`,
             source: parentNode.id,
             target: node.id,
             type: 'smoothstep',
             animated: false,
             style: { 
               stroke: activeNode && child.id === activeNode.id ? '#ff5722' : '#bdbdbd',
               strokeWidth: activeNode && child.id === activeNode.id ? 3 : 2
             }
           }
           edges.push(edge)
         }

        // Recursively create children (only if not collapsed and has children)
        if (child.children && child.children.length > 0 && !collapsedNodes.has(child.id)) {
          createTreeNodes(node, child.children, level + 1, childX, childY)
        }
      })
    }

    // Create all child nodes starting from the first level (no root node)
    if (structure.children && structure.children.length > 0 && !collapsedNodes.has(structure.id)) {
      // Create a virtual root for positioning calculations
      const virtualRoot = { id: 'virtual-root', position: { x: 400, y: 50 } }
      createTreeNodes(virtualRoot, structure.children, 1)
    }

    return { flowNodes: nodes, flowEdges: edges }
  }, [structure, activeNode, collapsedNodes])

  // Update nodes and edges when structure changes
  useEffect(() => {
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [flowNodes, flowEdges, setNodes, setEdges])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleNodeClick = useCallback((event, node) => {
    if (node.data.originalData) {
      onNodeClick(node.data.originalData)
    }
  }, [onNodeClick])

  const handleNodeDoubleClick = useCallback((event, node) => {
    if (node.data.originalData && node.data.level <= 2) {
      const newCollapsed = new Set(collapsedNodes)
      if (newCollapsed.has(node.data.originalData.id)) {
        newCollapsed.delete(node.data.originalData.id)
      } else {
        newCollapsed.add(node.data.originalData.id)
      }
      setCollapsedNodes(newCollapsed)
    }
  }, [collapsedNodes])

  if (!structure || !structure.children || structure.children.length === 0) {
    return (
      <div className="mindmap-empty">
        <p>No content to visualize</p>
        <p>Start writing in the editor to see your mindmap</p>
      </div>
    )
  }

  return (
    <div className="mindmap-visualization">
      <div className="mindmap-controls">
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color root"></div>
            <span>Main Topic</span>
          </div>
          <div className="legend-item">
            <div className="legend-color level1"></div>
            <span>Section</span>
          </div>
          <div className="legend-item">
            <div className="legend-color level2"></div>
            <span>Subsection</span>
          </div>
          <div className="legend-item">
            <div className="legend-color level3"></div>
            <span>Detail</span>
          </div>
        </div>
      </div>
      
      <div className="mindmap-flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          attributionPosition="bottom-left"
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: { strokeWidth: 2 }
          }}
        >
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              if (node.data.level === 0) return '#28a745'
              if (node.data.level === 1) return '#17a2b8'
              if (node.data.level === 2) return '#ffc107'
              return '#6c757d'
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
      
      <div className="mindmap-info">
        <p>Click on any node to navigate to that section in the editor</p>
        <p>Double-click on main topics/sections to expand/collapse • Use controls to zoom and pan</p>
      </div>
    </div>
  )
}

// Wrap with ReactFlowProvider
function MindMapVisualizationWithProvider(props) {
  return (
    <ReactFlowProvider>
      <MindMapVisualization {...props} />
    </ReactFlowProvider>
  )
}

export default MindMapVisualizationWithProvider