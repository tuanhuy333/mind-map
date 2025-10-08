import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, BarChart3, FileText, Search, Grid3X3, List, Trash2, LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import TimeoutWarning from './TimeoutWarning'
import { mindmapService } from '../services/mindmapService'
import { useAuth } from '../contexts/AuthContext'
import './HomePage.css'

function HomePage() {
  const [mindmaps, setMindmaps] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newMindmapName, setNewMindmapName] = useState('')
  const [newMindmapDescription, setNewMindmapDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { logout } = useAuth()

  // Load saved mindmaps from Supabase
  useEffect(() => {
    loadMindmaps()
  }, [])

  const loadMindmaps = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await mindmapService.getAll()
      setMindmaps(data)
    } catch (err) {
      console.error('Error loading mindmaps:', err)
      setError('Failed to load mindmaps')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setShowCreateModal(true)
    setNewMindmapName('')
    setNewMindmapDescription('')
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setNewMindmapName('')
    setNewMindmapDescription('')
  }

  const createNewMindmap = async () => {
    if (!newMindmapName.trim()) return

    try {
      const newMindmap = {
        name: newMindmapName.trim(),
        description: newMindmapDescription.trim(),
        content: '# New Mindmap\n\nStart writing your content here...',
        structure: {
          id: 'root',
          text: newMindmapName.trim(),
          children: []
        }
      }

      const createdMindmap = await mindmapService.create(newMindmap)
      setMindmaps(prev => [createdMindmap, ...prev])
      
      closeCreateModal()
      
      // Navigate to the new mindmap
      navigate(`/mindmap/${createdMindmap.id}`)
    } catch (err) {
      console.error('Error creating mindmap:', err)
      setError('Failed to create mindmap')
    }
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

  const deleteMindmap = async (mindmapId, e) => {
    e.stopPropagation()
    
    try {
      await mindmapService.delete(mindmapId)
      setMindmaps(prev => prev.filter(m => m.id !== mindmapId))
    } catch (err) {
      console.error('Error deleting mindmap:', err)
      setError('Failed to delete mindmap')
    }
  }

  const filteredMindmaps = mindmaps.filter(mindmap =>
    mindmap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mindmap.description && mindmap.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const countNodes = (node) => {
    if (!node || !node.children) return 0
    return 1 + node.children.reduce((total, child) => total + countNodes(child), 0)
  }

  return (
    <div className="homepage">
      <TimeoutWarning />
      <header className="homepage-header">
        <h1>
          <img src="/mindmap-icon.svg" alt="MindMap Icon" className="header-icon" />
          MindMap
        </h1>
        <p>Create interactive mindmaps with markdown content and visual connections</p>
      </header>

      <div className="toolbar">
        <div className="search-section">
          <div className="search-input-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search mindmaps by name or description..."
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
            className="logout-btn"
            onClick={logout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>

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
        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadMindmaps} className="retry-btn">
              Retry
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="mindmaps-container grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="mindmap-card-skeleton">
                <div className="skeleton-header">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-delete"></div>
                </div>
                <div className="skeleton-description"></div>
                <div className="skeleton-stats">
                  <div className="skeleton-stat"></div>
                  <div className="skeleton-stat"></div>
                </div>
                <div className="skeleton-preview"></div>
                <div className="skeleton-preview"></div>
                <div className="skeleton-dates">
                  <div className="skeleton-date"></div>
                </div>
              </div>
            ))}
          </div>
        ) : mindmaps.length === 0 ? (
          <div className="empty-state">
            <p>No mindmaps yet</p>
          </div>
        ) : filteredMindmaps.length === 0 ? (
          <div className="empty-search-state">
            <div className="empty-search-icon">
              <Search size={48} />
            </div>
            <h3>No results found</h3>
            <p>No mindmaps match your search for "<strong>{searchTerm}</strong>"</p>
            <p className="search-suggestion">Try searching with different keywords or check your spelling</p>
          </div>
        ) : (
          <div className={`mindmaps-container ${viewMode}`}>
            {filteredMindmaps.map((mindmap) => {
              const lastUpdated = mindmap.updated_at || mindmap.created_at
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
                  
                  {mindmap.description && (
                    <p className="mindmap-description">
                      {mindmap.description}
                    </p>
                  )}
                  
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
                    {mindmap.updated_at && mindmap.updated_at !== mindmap.created_at ? (
                      <p className="mindmap-date">
                        Updated: {new Date(lastUpdated).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="mindmap-date">
                        Created: {new Date(mindmap.created_at).toLocaleDateString()}
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
              
              <label htmlFor="mindmap-description">Description (Optional)</label>
              <textarea
                id="mindmap-description"
                placeholder="Enter a description for your mindmap..."
                value={newMindmapDescription}
                onChange={(e) => setNewMindmapDescription(e.target.value)}
                className="modal-textarea"
                rows="3"
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
