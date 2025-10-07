import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import HomePage from './components/HomePage'
import MindMapPage from './components/MindMapPage'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mindmap/:id" element={<MindMapPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
