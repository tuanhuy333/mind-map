import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'

function HomePage() {
  const [mindmaps, setMindmaps] = useState([])
  const [newMindmapName, setNewMindmapName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  // Load saved mindmaps from localStorage
  useEffect(() => {
    const savedMindmaps = JSON.parse(localStorage.getItem('mindmaps') || '[]')
    setMindmaps(savedMindmaps)
  }, [])

  const createNewMindmap = () => {
    if (!newMindmapName.trim()) return

    const newMindmap = {
      id: Date.now().toString(),
      name: newMindmapName,
      createdAt: new Date().toISOString(),
      content: '# New Mindmap\n\nStart writing your content here...',
      structure: {
        id: 'root',
        text: newMindmapName,
        children: []
      }
    }

    const updatedMindmaps = [...mindmaps, newMindmap]
    setMindmaps(updatedMindmaps)
    localStorage.setItem('mindmaps', JSON.stringify(updatedMindmaps))
    setNewMindmapName('')
    
    // Navigate to the new mindmap
    navigate(`/mindmap/${newMindmap.id}`)
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

      <div className="create-section">
        <div className="create-form">
          <input
            type="text"
            placeholder="New mindmap name..."
            value={newMindmapName}
            onChange={(e) => setNewMindmapName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createNewMindmap()}
          />
          <button 
            className="create-btn"
            onClick={createNewMindmap} 
            disabled={!newMindmapName.trim()}
            title="Create mindmap"
          >
            +
          </button>
        </div>
      </div>

      <div className="mindmaps-section">
        {mindmaps.length > 0 && (
          <div className="search-section">
            <input
              type="text"
              placeholder="Search mindmaps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        )}
        
        {mindmaps.length === 0 ? (
          <div className="empty-state">
            <p>No mindmaps yet</p>
          </div>
        ) : (
          <div className="mindmaps-grid">
            {/* Plus button card for creating new mindmap */}
            <div className="mindmap-card plus-card" onClick={() => document.querySelector('.create-form input').focus()}>
              <div className="plus-icon">+</div>
              <p>New Mindmap</p>
            </div>
            
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
                      ×
                    </button>
                  </div>
                  
                  <div className="mindmap-stats">
                    <span className="stat-item">
                      <span className="stat-icon">📊</span>
                      {nodeCount} nodes
                    </span>
                    <span className="stat-item">
                      <span className="stat-icon">📝</span>
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
    </div>
  )
}

export default HomePage
