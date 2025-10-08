import { createContext, useContext, useState, useEffect, useRef } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const timeoutRef = useRef(null)
  const warningTimeoutRef = useRef(null)
  const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes in milliseconds
  const WARNING_TIME = 2 * 60 * 1000 // 2 minutes before logout

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('isAuthenticated')
    setIsAuthenticated(authStatus === 'true')
    setIsLoading(false)
  }, [])

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }
    setShowTimeoutWarning(false)
    
    if (isAuthenticated) {
      // Set warning timeout (2 minutes before logout)
      warningTimeoutRef.current = setTimeout(() => {
        setShowTimeoutWarning(true)
      }, INACTIVITY_TIMEOUT - WARNING_TIME)
      
      // Set logout timeout
      timeoutRef.current = setTimeout(() => {
        logout()
      }, INACTIVITY_TIMEOUT)
    }
  }

  const login = () => {
    setIsAuthenticated(true)
    localStorage.setItem('isAuthenticated', 'true')
    resetTimeout()
  }

  const logout = () => {
    setIsAuthenticated(false)
    setShowTimeoutWarning(false)
    localStorage.removeItem('isAuthenticated')
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }
  }

  // Set up activity listeners when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      resetTimeout()

      // Listen for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
      
      const handleActivity = () => {
        resetTimeout()
      }

      events.forEach(event => {
        document.addEventListener(event, handleActivity, true)
      })

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleActivity, true)
        })
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current)
        }
      }
    }
  }, [isAuthenticated])

  const value = {
    isAuthenticated,
    isLoading,
    showTimeoutWarning,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
