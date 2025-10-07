import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, BarChart3, FileText, Search, Grid3X3, List, Trash2 } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import './HomePage.css'

function HomePage() {
  const [mindmaps, setMindmaps] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newMindmapName, setNewMindmapName] = useState('')
  const navigate = useNavigate()

  // Load saved mindmaps from localStorage
  useEffect(() => {
    const savedMindmaps = JSON.parse(localStorage.getItem('mindmaps') || '[]')
    setMindmaps(savedMindmaps)
  }, [])

  const openCreateModal = () => {
    setShowCreateModal(true)
    setNewMindmapName('')
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setNewMindmapName('')
  }

  const createNewMindmap = () => {
    if (!newMindmapName.trim()) return

    const newMindmap = {
      id: Date.now().toString(),
      name: newMindmapName.trim(),
      createdAt: new Date().toISOString(),
      content: '# New Mindmap\n\nStart writing your content here...',
      structure: {
        id: 'root',
        text: newMindmapName.trim(),
        children: []
      }
    }

    const updatedMindmaps = [...mindmaps, newMindmap]
    setMindmaps(updatedMindmaps)
    localStorage.setItem('mindmaps', JSON.stringify(updatedMindmaps))
    
    closeCreateModal()
    
    // Navigate to the new mindmap
    navigate(`/mindmap/${newMindmap.id}`)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      createNewMindmap()
    } else if (e.key === 'Escape') {
      closeCreateModal()
    }
  }

  const openMindmap = (mindmapId) => {
    navigate(`/mindmap/${mindmapId}`)
  }

  const deleteMindmap = (mindmapId, e) => {
    e.stopPropagation()
    const updatedMindmaps = mindmaps.filter(m => m.id !== mindmapId)
    setMindmaps(updatedMindmaps)
    localStorage.setItem('mindmaps', JSON.stringify(updatedMindmaps))
  }

  const filteredMindmaps = mindmaps.filter(mindmap =>
    mindmap.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const countNodes = (node) => {
    if (!node || !node.children) return 0
    return 1 + node.children.reduce((total, child) => total + countNodes(child), 0)
  }

  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>MindMap</h1>
        <p>Create interactive mindmaps with markdown content and visual connections</p>
      </header>

      <div className="toolbar">
        <div className="search-section">
          <div className="search-input-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search for Map"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="toolbar-actions">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Grid3X3 size={18} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List size={18} />
            </button>
          </div>
          
          <ThemeToggle />
          
          <button 
            className="new-project-btn"
            onClick={openCreateModal}
            title="Create new mindmap"
          >
            <Plus size={18} />
            New Map
          </button>
        </div>
      </div>

      <div className="mindmaps-section">
        
        {mindmaps.length === 0 ? (
          <div className="empty-state">
            <p>No mindmaps yet</p>
          </div>
        ) : (
          <div className={`mindmaps-container ${viewMode}`}>
            {filteredMindmaps.map((mindmap) => {
              const lastUpdated = mindmap.updatedAt || mindmap.createdAt
              const contentPreview = mindmap.content.replace(/#+\s*/g, '').substring(0, 80)
              const nodeCount = mindmap.structure ? countNodes(mindmap.structure) : 0
              
              return (
                <div
                  key={mindmap.id}
                  className="mindmap-card"
                  onClick={() => openMindmap(mindmap.id)}
                >
                  <div className="mindmap-card-header">
                    <h3>{mindmap.name}</h3>
                    <button
                      className="delete-btn"
                      onClick={(e) => deleteMindmap(mindmap.id, e)}
                      title="Delete mindmap"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="mindmap-stats">
                    <span className="stat-item">
                      <span className="stat-icon">
                        <BarChart3 size={16} />
                      </span>
                      {nodeCount} nodes
                    </span>
                    <span className="stat-item">
                      <span className="stat-icon">
                        <FileText size={16} />
                      </span>
                      {mindmap.content.length} chars
                    </span>
                  </div>
                  
                  {contentPreview && (
                    <p className="mindmap-preview">
                      {contentPreview}...
                    </p>
                  )}
                  
                  <div className="mindmap-dates">
                    <p className="mindmap-date">
                      Created: {new Date(mindmap.createdAt).toLocaleDateString()}
                    </p>
                    {mindmap.updatedAt && mindmap.updatedAt !== mindmap.createdAt && (
                      <p className="mindmap-date">
                        Updated: {new Date(lastUpdated).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Mindmap Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Mindmap</h2>
              <button className="modal-close-btn" onClick={closeCreateModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <label htmlFor="mindmap-name">Mindmap Name</label>
              <input
                id="mindmap-name"
                type="text"
                placeholder="Enter mindmap name..."
                value={newMindmapName}
                onChange={(e) => setNewMindmapName(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
                className="modal-input"
              />
            </div>
            <div className="modal-footer">
              <button className="modal-btn modal-btn-cancel" onClick={closeCreateModal}>
                Cancel
              </button>
              <button 
                className="modal-btn modal-btn-create" 
                onClick={createNewMindmap}
                disabled={!newMindmapName.trim()}
              >
                Create Mindmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
