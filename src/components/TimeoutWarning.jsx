import { useState, useEffect } from 'react'
import { Clock, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './TimeoutWarning.css'

function TimeoutWarning() {
  const { showTimeoutWarning } = useAuth()
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes in seconds
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (showTimeoutWarning) {
      setIsVisible(true)
      setTimeLeft(120) // Reset to 2 minutes
      
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setIsVisible(false)
    }
  }, [showTimeoutWarning])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isVisible) return null

  return (
    <div className="timeout-warning-overlay">
      <div className="timeout-warning">
        <div className="warning-header">
          <div className="warning-icon">
            <Clock size={24} />
          </div>
          <h3>Session Timeout Warning</h3>
          <button 
            className="close-btn"
            onClick={() => setIsVisible(false)}
            title="Dismiss warning"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="warning-content">
          <p>Your session will expire in <strong>{formatTime(timeLeft)}</strong></p>
          <p className="warning-message">
            Move your mouse or press any key to stay logged in.
          </p>
        </div>
        
        <div className="timeout-progress">
          <div 
            className="progress-bar"
            style={{ width: `${(timeLeft / 120) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default TimeoutWarning
