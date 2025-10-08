import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Minus, Edit3, Map, FileText } from 'lucide-react'
import MarkdownEditor from './MarkdownEditor'
import MindMapVisualization from './MindMapVisualization'
import ContentViewer from './ContentViewer'
import { mindmapService } from '../services/mindmapService'
import './MindMapPage.css'

function MindMapPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [mindmap, setMindmap] = useState(null)
  const [activeSection, setActiveSection] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [panelStates, setPanelStates] = useState({
    panel1: true,  // Markdown Editor
    panel2: true,  // Mind Map
    panel3: true   // Content Viewer
  })

  useEffect(() => {
    loadMindmap()
  }, [id])

  // Handle landscape orientation - show all panels in 2+1 layout
  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight
      
      if (isLandscape) {
        // In landscape, show all panels in 2+1 layout
        setPanelStates(prev => ({
          ...prev,
          panel1: true,
          panel2: true,
          panel3: true
        }))
      } else {
        // In portrait, show all panels in vertical stack
        setPanelStates(prev => ({
          ...prev,
          panel1: true,
          panel2: true,
          panel3: true
        }))
      }
    }

    // Check initial orientation
    handleOrientationChange()

    // Listen for orientation changes
    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  const loadMindmap = async () => {
    try {
      setLoading(true)
      setError(null)
      const foundMindmap = await mindmapService.getById(id)
      
      if (foundMindmap) {
        setMindmap(foundMindmap)
        setContent(foundMindmap.content)
        setActiveSection(null)
      } else {
        // Mindmap not found, redirect to home
        navigate('/')
      }
    } catch (err) {
      console.error('Error loading mindmap:', err)
      setError('Failed to load mindmap')
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async (newContent) => {
    setContent(newContent)
    
    // Update mindmap structure based on content
    const structure = parseContentToStructure(newContent)
    
    const updatedMindmap = {
      ...mindmap,
      content: newContent,
      structure: structure
    }
    
    setMindmap(updatedMindmap)
    
    // Save to Supabase
    try {
      setSaving(true)
      await mindmapService.update(updatedMindmap)
    } catch (err) {
      console.error('Error saving mindmap:', err)
      setError('Failed to save mindmap')
    } finally {
      setSaving(false)
    }
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
    
    // Force layout recalculation after state update
    setTimeout(() => {
      // Trigger a reflow to ensure layout updates
      const panelsContainer = document.querySelector('.panels-container')
      if (panelsContainer) {
        panelsContainer.style.display = 'none'
        panelsContainer.offsetHeight // Force reflow
        panelsContainer.style.display = 'grid'
      }
    }, 0)
  }

  const formatLastUpdated = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    
    // Check if the date is today
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      // Show only time if it's today
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      // Show full date and time if it's not today
      return date.toLocaleString()
    }
  }

  if (loading) {
    return (
      <div className="mindmap-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mindmap-page">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadMindmap} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!mindmap) {
    return (
      <div className="mindmap-page">
        <div className="error-state">
          <p>Mindmap not found</p>
          <button onClick={() => navigate('/')} className="retry-btn">
            Back to Home
          </button>
        </div>
      </div>
    )
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
            Last updated: {formatLastUpdated(mindmap.updated_at || mindmap.created_at)}
          </span>
          {saving && <span className="saving-indicator">Saving...</span>}
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
