import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './Authentication.css'

function Authentication() {
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const inputRefs = useRef([])
  const { login } = useAuth()

  const CORRECT_PIN = '111111'

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleInputChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-authenticate when all 6 digits are entered
    const updatedPin = [...newPin]
    if (updatedPin.every(digit => digit !== '')) {
      setTimeout(() => {
        authenticatePin(updatedPin.join(''))
      }, 100) // Small delay to ensure UI updates
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handlePaste(e.clipboardData.getData('text'))
    }
  }

  const handlePaste = (pastedData) => {
    const digits = pastedData.replace(/\D/g, '').slice(0, 6)
    if (digits.length === 6) {
      const newPin = digits.split('')
      setPin(newPin)
      setError('')
      // Focus the last input
      inputRefs.current[5]?.focus()
    }
  }

  const authenticatePin = async (enteredPin) => {
    if (enteredPin.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setIsLoading(true)
    setError('')

    // Simulate API call delay
    setTimeout(() => {
      if (enteredPin === CORRECT_PIN) {
        login()
        navigate('/')
      } else {
        setError('Incorrect PIN. Please try again.')
        setPin(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="authentication-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon">
            <Lock size={48} />
          </div>
          <h1>Welcome to MindMap</h1>
          <p>Enter your 6-digit PIN to continue</p>
        </div>

        <div className="auth-form">
          <div className="pin-inputs">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="password"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`pin-input ${error ? 'error' : ''}`}
                disabled={isLoading}
              />
            ))}
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {isLoading && (
            <div className="loading-indicator">
              <div className="loading-spinner-small"></div>
              <span>Verifying...</span>
            </div>
          )}
        </div>

        <div className="auth-footer">
          <p className="auth-hint">
            <Lock size={14} />
            Your data is protected with PIN authentication
          </p>
        </div>
      </div>
    </div>
  )
}

export default Authentication
