import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import HomePage from './components/HomePage'
import MindMapPage from './components/MindMapPage'
import Authentication from './components/Authentication'
import './App.css'

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Authentication />
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mindmap/:id" element={<MindMapPage />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <ProtectedRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
