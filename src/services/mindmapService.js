import { supabase } from '../lib/supabase'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
}

// Fallback to localStorage if Supabase is not configured
const fallbackToLocalStorage = (operation, ...args) => {
  console.warn('Supabase not configured, falling back to localStorage')
  
  switch (operation) {
    case 'getAll':
      return Promise.resolve(JSON.parse(localStorage.getItem('mindmaps') || '[]'))
    
    case 'getById':
      const allMindmaps = JSON.parse(localStorage.getItem('mindmaps') || '[]')
      const mindmap = allMindmaps.find(m => m.id === args[0])
      return Promise.resolve(mindmap || null)
    
    case 'create':
      const newMindmap = args[0]
      const existingMindmaps = JSON.parse(localStorage.getItem('mindmaps') || '[]')
      const updatedMindmaps = [...existingMindmaps, newMindmap]
      localStorage.setItem('mindmaps', JSON.stringify(updatedMindmaps))
      return Promise.resolve(newMindmap)
    
    case 'update':
      const updatedMindmap = args[0]
      const allMindmapsForUpdate = JSON.parse(localStorage.getItem('mindmaps') || '[]')
      const index = allMindmapsForUpdate.findIndex(m => m.id === updatedMindmap.id)
      if (index !== -1) {
        allMindmapsForUpdate[index] = updatedMindmap
        localStorage.setItem('mindmaps', JSON.stringify(allMindmapsForUpdate))
      }
      return Promise.resolve(updatedMindmap)
    
    case 'delete':
      const mindmapId = args[0]
      const allMindmapsForDelete = JSON.parse(localStorage.getItem('mindmaps') || '[]')
      const filteredMindmaps = allMindmapsForDelete.filter(m => m.id !== mindmapId)
      localStorage.setItem('mindmaps', JSON.stringify(filteredMindmaps))
      return Promise.resolve(true)
    
    default:
      return Promise.reject(new Error('Unknown operation'))
  }
}

export const mindmapService = {
  // Get all mindmaps
  async getAll() {
    if (!isSupabaseConfigured()) {
      return fallbackToLocalStorage('getAll')
    }

    try {
      const { data, error } = await supabase
        .from('mindmaps')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching mindmaps:', error)
      return fallbackToLocalStorage('getAll')
    }
  },

  // Get mindmap by ID
  async getById(id) {
    if (!isSupabaseConfigured()) {
      return fallbackToLocalStorage('getById', id)
    }

    try {
      const { data, error } = await supabase
        .from('mindmaps')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching mindmap:', error)
      return fallbackToLocalStorage('getById', id)
    }
  },

  // Create new mindmap
  async create(mindmapData) {
    if (!isSupabaseConfigured()) {
      return fallbackToLocalStorage('create', mindmapData)
    }

    try {
      const { data, error } = await supabase
        .from('mindmaps')
        .insert([mindmapData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating mindmap:', error)
      return fallbackToLocalStorage('create', mindmapData)
    }
  },

  // Update existing mindmap
  async update(mindmapData) {
    if (!isSupabaseConfigured()) {
      return fallbackToLocalStorage('update', mindmapData)
    }

    try {
      const { data, error } = await supabase
        .from('mindmaps')
        .update({
          name: mindmapData.name,
          description: mindmapData.description,
          content: mindmapData.content,
          structure: mindmapData.structure,
          updated_at: new Date().toISOString()
        })
        .eq('id', mindmapData.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating mindmap:', error)
      return fallbackToLocalStorage('update', mindmapData)
    }
  },

  // Delete mindmap
  async delete(id) {
    if (!isSupabaseConfigured()) {
      return fallbackToLocalStorage('delete', id)
    }

    try {
      const { error } = await supabase
        .from('mindmaps')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting mindmap:', error)
      return fallbackToLocalStorage('delete', id)
    }
  }
}
