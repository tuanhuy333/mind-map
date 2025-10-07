import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Minus, Edit3, Map, FileText } from 'lucide-react'
import MarkdownEditor from './MarkdownEditor'
import MindMapVisualization from './MindMapVisualization'
import ContentViewer from './ContentViewer'
import './MindMapPage.css'

function MindMapPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [mindmap, setMindmap] = useState(null)
  const [activeSection, setActiveSection] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [panelStates, setPanelStates] = useState({
    panel1: true,  // Markdown Editor
    panel2: true,  // Mind Map
    panel3: true   // Content Viewer
  })

  useEffect(() => {
    loadMindmap()
  }, [id])

  const loadMindmap = () => {
    const savedMindmaps = JSON.parse(localStorage.getItem('mindmaps') || '[]')
    const foundMindmap = savedMindmaps.find(m => m.id === id)
    
    if (foundMindmap) {
      setMindmap(foundMindmap)
      setContent(foundMindmap.content)
      setActiveSection(null)
    } else {
      // Mindmap not found, redirect to home
      navigate('/')
    }
    setLoading(false)
  }

  const saveContent = (newContent) => {
    setContent(newContent)
    
    // Update mindmap structure based on content
    const structure = parseContentToStructure(newContent)
    
    const updatedMindmap = {
      ...mindmap,
      content: newContent,
      structure: structure,
      updatedAt: new Date().toISOString()
    }
    
    setMindmap(updatedMindmap)
    
    // Save to localStorage
    const savedMindmaps = JSON.parse(localStorage.getItem('mindmaps') || '[]')
    const updatedMindmaps = savedMindmaps.map(m => 
      m.id === id ? updatedMindmap : m
    )
    localStorage.setItem('mindmaps', JSON.stringify(updatedMindmaps))
  }

  const parseContentToStructure = (content) => {
    const lines = content.split('\n')
    const structure = { id: 'root', text: mindmap?.name || 'Root', children: [] }
    let currentLevel = 0
    let currentPath = [structure]
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('#')) {
        const level = (trimmedLine.match(/^#+/) || [''])[0].length
        const text = trimmedLine.replace(/^#+\s*/, '')
        
        const node = {
          id: `section-${index}`,
          text: text,
          level: level,
          lineNumber: index,
          children: []
        }
        
        // Adjust current path based on level
        while (currentPath.length > level) {
          currentPath.pop()
        }
        
        // Add to parent
        const parent = currentPath[currentPath.length - 1]
        if (parent) {
          parent.children.push(node)
          currentPath.push(node)
        }
      }
    })
    
    return structure
  }

  const handleNodeClick = (node) => {
    setActiveSection(node)
    // The ContentViewer will handle scrolling to the section
  }

  const togglePanel = (panelName) => {
    setPanelStates(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }))
  }

  if (loading) {
    return <div className="loading">Loading mindmap...</div>
  }

  if (!mindmap) {
    return <div className="error">Mindmap not found</div>
  }

  return (
    <div className="mindmap-page">
      <header className="mindmap-header">
        <button className="back-btn" onClick={() => navigate('/')} title="Back to Home">
          <ArrowLeft size={20} />
        </button>
        <h1>{mindmap.name}</h1>
        <div className="header-actions">
          <span className="last-updated">
            Last updated: {new Date(mindmap.updatedAt || mindmap.createdAt).toLocaleString()}
          </span>
        </div>
      </header>

      <div className="panels-container">
        {panelStates.panel1 && (
          <div className="panel panel-1">
            <div className="panel-header">
              <div className="panel-title-section">
                <h3>Markdown Editor</h3>
                <span className="panel-subtitle">Write your content here</span>
              </div>
              <button 
                className="panel-toggle-btn"
                onClick={() => togglePanel('panel1')}
                title="Hide panel"
              >
                <Minus size={18} />
              </button>
            </div>
            <MarkdownEditor
              content={content}
              onContentChange={saveContent}
              activeSection={activeSection}
            />
          </div>
        )}

        {panelStates.panel2 && (
          <div className="panel panel-2">
            <div className="panel-header">
              <div className="panel-title-section">
                <h3>Mind Map</h3>
                <span className="panel-subtitle">Interactive visualization</span>
              </div>
              <button 
                className="panel-toggle-btn"
                onClick={() => togglePanel('panel2')}
                title="Hide panel"
              >
                <Minus size={18} />
              </button>
            </div>
            <MindMapVisualization
              structure={mindmap.structure}
              onNodeClick={handleNodeClick}
              activeNode={activeSection}
            />
          </div>
        )}

        {panelStates.panel3 && (
          <div className="panel panel-3">
            <button 
              className="panel-toggle-btn panel-3-hide-btn"
              onClick={() => togglePanel('panel3')}
              title="Hide panel"
            >
              <Minus size={18} />
            </button>
            <ContentViewer
              content={content}
              activeSection={activeSection}
            />
          </div>
        )}
      </div>

      {/* Panel restore buttons */}
      <div className="panel-restore-controls">
        {!panelStates.panel1 && (
          <button 
            className="restore-panel-btn"
            onClick={() => togglePanel('panel1')}
            title="Show Markdown Editor"
          >
            <span>
              <Edit3 size={18} />
            </span>
            <span>Editor</span>
          </button>
        )}
        {!panelStates.panel2 && (
          <button 
            className="restore-panel-btn"
            onClick={() => togglePanel('panel2')}
            title="Show Mind Map"
          >
            <span>
              <Map size={18} />
            </span>
            <span>Mind Map</span>
          </button>
        )}
        {!panelStates.panel3 && (
          <button 
            className="restore-panel-btn"
            onClick={() => togglePanel('panel3')}
            title="Show Content Viewer"
          >
            <span>
              <FileText size={18} />
            </span>
            <span>Viewer</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default MindMapPage
