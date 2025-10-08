import { useState, useRef, useEffect } from 'react'
import './MarkdownEditor.css'

function MarkdownEditor({ content, onContentChange, activeSection }) {
  const [localContent, setLocalContent] = useState(content)
  const textareaRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 })
  const [currentWord, setCurrentWord] = useState('')
  const suggestionsListRef = useRef(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // Markdown suggestions data
  const markdownSuggestions = [
    { label: 'Heading 1', value: '# ', description: 'Large heading' },
    { label: 'Heading 2', value: '## ', description: 'Medium heading' },
    { label: 'Heading 3', value: '### ', description: 'Small heading' },
    { label: 'Bold', value: '**text**', description: 'Bold text' },
    { label: 'Italic', value: '*text*', description: 'Italic text' },
    { label: 'Code', value: '`code`', description: 'Inline code' },
    { label: 'Code Block', value: '```\ncode\n```', description: 'Code block' },
    { label: 'Link', value: '[text](url)', description: 'Hyperlink' },
    { label: 'Image', value: '![alt](url)', description: 'Image' },
    { label: 'Bullet List', value: '- ', description: 'Bullet point' },
    { label: 'Numbered List', value: '1. ', description: 'Numbered list' },
    { label: 'Quote', value: '> ', description: 'Blockquote' },
    { label: 'Horizontal Rule', value: '---', description: 'Divider line' },
    { label: 'Table', value: '| Header | Header |\n|--------|--------|\n| Cell   | Cell   |', description: 'Table' },
    { label: 'Task List', value: '- [ ] ', description: 'Checkbox' },
    { label: 'Strikethrough', value: '~~text~~', description: 'Strikethrough text' },
    { label: 'Indent', value: '  ', description: '2 spaces indentation' },
    { label: 'Double Indent', value: '    ', description: '4 spaces indentation' },
    { label: 'Triple Indent', value: '      ', description: '6 spaces indentation' }
  ]

  useEffect(() => {
    setLocalContent(content)
    setHasUnsavedChanges(false)
  }, [content])

  useEffect(() => {
    if (activeSection && activeSection.lineNumber !== undefined) {
      scrollToSection(activeSection.lineNumber)
    }
  }, [activeSection])

  // Auto-scroll selected suggestion into view
  useEffect(() => {
    if (showSuggestions && suggestionsListRef.current) {
      const selectedItem = suggestionsListRef.current.children[selectedSuggestionIndex]
      if (selectedItem) {
        selectedItem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }
    }
  }, [selectedSuggestionIndex, showSuggestions])

  const handleChange = (e) => {
    const newContent = e.target.value
    setLocalContent(newContent)
    setHasUnsavedChanges(newContent !== content)
    
    // Check for suggestions trigger
    checkForSuggestions(e.target)
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    if (!hasUnsavedChanges) return
    
    try {
      setIsSaving(true)
      await onContentChange(localContent)
      setHasUnsavedChanges(false)
      showToast('Changes saved successfully!', 'success')
    } catch (error) {
      console.error('Error saving content:', error)
      showToast('Failed to save changes. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const checkForSuggestions = (textarea) => {
    const cursorPos = textarea.selectionStart
    const textBefore = textarea.value.substring(0, cursorPos)
    const lines = textBefore.split('\n')
    const currentLine = lines[lines.length - 1]
    
    // Check if user typed a trigger character
    const triggerMatch = currentLine.match(/(\s*)([#*`>|~-]|\d+\.|\s+)$/)
    
    if (triggerMatch) {
      const trigger = triggerMatch[2]
      const filteredSuggestions = markdownSuggestions.filter(suggestion => 
        suggestion.value.toLowerCase().includes(trigger.toLowerCase()) ||
        suggestion.label.toLowerCase().includes(trigger.toLowerCase())
      )
      
      if (filteredSuggestions.length > 0) {
        setSuggestions(filteredSuggestions)
        setCurrentWord(trigger)
        setSelectedSuggestionIndex(0)
        setShowSuggestions(true)
        updateSuggestionPosition(textarea, cursorPos)
      } else {
        setShowSuggestions(false)
        setSuggestions([])
      }
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }

  const updateSuggestionPosition = (textarea, cursorPos) => {
    const rect = textarea.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    
    // Calculate position below the textarea
    let top = rect.bottom + 5
    let left = rect.left
    
    // Check if dropdown would go off screen and adjust
    const dropdownHeight = 300 // max-height from CSS
    const dropdownWidth = 400 // max-width from CSS
    
    // Adjust vertical position if it would go off screen
    if (top + dropdownHeight > viewportHeight) {
      top = rect.top - dropdownHeight - 5
    }
    
    // Adjust horizontal position if it would go off screen
    if (left + dropdownWidth > viewportWidth) {
      left = viewportWidth - dropdownWidth - 10
    }
    
    // Ensure it doesn't go off the left side
    if (left < 10) {
      left = 10
    }
    
    setSuggestionPosition({ top, left })
  }

  const insertSuggestion = (suggestion) => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const textBefore = textarea.value.substring(0, start)
    const textAfter = textarea.value.substring(end)
    
    // Remove the trigger characters
    const lines = textBefore.split('\n')
    const currentLine = lines[lines.length - 1]
    const triggerMatch = currentLine.match(/(\s*)([#*`>|~-]|\d+\.|\s+)$/)
    
    let newText
    if (triggerMatch) {
      const beforeTrigger = textBefore.substring(0, textBefore.length - triggerMatch[2].length)
      newText = beforeTrigger + suggestion.value + textAfter
    } else {
      newText = textBefore + suggestion.value + textAfter
    }
    
    setLocalContent(newText)
    setHasUnsavedChanges(newText !== content)
    setShowSuggestions(false)
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      const newCursorPos = start - (triggerMatch ? triggerMatch[2].length : 0) + suggestion.value.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  const scrollToSection = (lineNumber) => {
    if (textareaRef.current) {
      const lines = localContent.split('\n')
      let position = 0
      
      for (let i = 0; i < lineNumber && i < lines.length; i++) {
        position += lines[i].length + 1 // +1 for newline
      }
      
      textareaRef.current.setSelectionRange(position, position)
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleKeyDown = (e) => {
    const textarea = e.target
    const cursorPos = textarea.selectionStart
    const textBefore = textarea.value.substring(0, cursorPos)
    const lines = textBefore.split('\n')
    const currentLine = lines[lines.length - 1]
    
    // Handle Ctrl+S for save
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
      return
    }
    
    // Handle suggestion navigation
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopPropagation()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        return
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        e.stopPropagation()
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        return
      }
      
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        e.stopPropagation()
        if (suggestions[selectedSuggestionIndex]) {
          insertSuggestion(suggestions[selectedSuggestionIndex])
        }
        return
      }
      
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        setShowSuggestions(false)
        return
      }
    }
    
    // Handle Tab key
    if (e.key === 'Tab') {
      e.preventDefault()
      
      if (e.shiftKey) {
        // Shift+Tab: Remove indentation
        const match = currentLine.match(/^(\s{1,2})/)
        if (match) {
          const indentToRemove = match[1].length
          const newText = textarea.value.substring(0, cursorPos - indentToRemove) + 
                         textarea.value.substring(cursorPos)
          setLocalContent(newText)
          
          setTimeout(() => {
            const newCursorPos = cursorPos - indentToRemove
            textarea.setSelectionRange(newCursorPos, newCursorPos)
          }, 0)
        }
      } else {
        // Tab: Add indentation (2 spaces)
        const indent = '  '
        const newText = textarea.value.substring(0, cursorPos) + indent + 
                       textarea.value.substring(cursorPos)
        setLocalContent(newText)
        
        setTimeout(() => {
          const newCursorPos = cursorPos + indent.length
          textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
      }
    }
    
    // Auto-indent for lists
    if (e.key === 'Enter') {
      // Check if current line starts with a list marker
      const listMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s/)
      if (listMatch) {
        e.preventDefault()
        const indent = listMatch[1] + '  ' // Add 2 spaces for indentation
        const newText = textarea.value.substring(0, cursorPos) + '\n' + indent + 
                       textarea.value.substring(cursorPos)
        setLocalContent(newText)
        
        // Set cursor position after the newline and indent
        setTimeout(() => {
          const newCursorPos = cursorPos + 1 + indent.length
          textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
      }
    }
  }

  return (
    <div className="markdown-editor">
      <div className="editor-toolbar">
        <div className="toolbar-section">
          {hasUnsavedChanges && <span className="unsaved-indicator">Unsaved changes</span>}
          {isSaving && (
            <div className="saving-indicator">
              <div className="loading-spinner-small"></div>
              <span>Saving...</span>
            </div>
          )}
        </div>
        <div className="toolbar-section">
          <button
            className="toolbar-btn"
            onClick={() => {
              const textarea = textareaRef.current
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              const selectedText = localContent.substring(start, end)
              const newText = localContent.substring(0, start) + 
                            `**${selectedText}**` + 
                            localContent.substring(end)
              setLocalContent(newText)
              setHasUnsavedChanges(newText !== content)
            }}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => {
              const textarea = textareaRef.current
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              const selectedText = localContent.substring(start, end)
              const newText = localContent.substring(0, start) + 
                            `*${selectedText}*` + 
                            localContent.substring(end)
              setLocalContent(newText)
              setHasUnsavedChanges(newText !== content)
            }}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => {
              const textarea = textareaRef.current
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              const selectedText = localContent.substring(start, end)
              const newText = localContent.substring(0, start) + 
                            `# ${selectedText}` + 
                            localContent.substring(end)
              setLocalContent(newText)
              setHasUnsavedChanges(newText !== content)
            }}
            title="Heading"
          >
            H1
          </button>
          <button
            className="toolbar-btn"
            onClick={() => {
              const textarea = textareaRef.current
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              const selectedText = localContent.substring(start, end)
              const lines = selectedText.split('\n')
              const indentedLines = lines.map(line => '  ' + line).join('\n')
              const newText = localContent.substring(0, start) + 
                            indentedLines + 
                            localContent.substring(end)
              setLocalContent(newText)
              setHasUnsavedChanges(newText !== content)
            }}
            title="Indent (Tab)"
          >
            ⇥
          </button>
          <button
            className="toolbar-btn"
            onClick={() => {
              const textarea = textareaRef.current
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              const selectedText = localContent.substring(start, end)
              const lines = selectedText.split('\n')
              const unindentedLines = lines.map(line => {
                if (line.startsWith('  ')) {
                  return line.substring(2)
                }
                return line
              }).join('\n')
              const newText = localContent.substring(0, start) + 
                            unindentedLines + 
                            localContent.substring(end)
              setLocalContent(newText)
              setHasUnsavedChanges(newText !== content)
            }}
            title="Unindent (Shift+Tab)"
          >
            ⇤
          </button>
          <button
            className="toolbar-btn"
            onClick={() => {
              // Test suggestions by showing all markdown suggestions
              setSuggestions(markdownSuggestions)
              setShowSuggestions(true)
              setSelectedSuggestionIndex(0)
              if (textareaRef.current) {
                updateSuggestionPosition(textareaRef.current, textareaRef.current.selectionStart)
              }
            }}
            title="Show Markdown Suggestions"
          >
            💡
          </button>
        </div>
      </div>
      
      <textarea
        ref={textareaRef}
        value={localContent}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Start writing your markdown content here...

# Main Topic
## Subtopic 1
### Details
- List item 1
  - Nested item (use Tab to indent)
- List item 2

## Subtopic 2
More content here...

Tip: Use Tab to indent, Shift+Tab to unindent"
        className="editor-textarea"
      />
      
      <div className="editor-footer">
        <div className="footer-left">
          <div className="word-count">
            Words: {localContent.split(/\s+/).filter(word => word.length > 0).length}
          </div>
          <div className="line-count">
            Lines: {localContent.split('\n').length}
          </div>
        </div>
        <div className="footer-right">
          <button
            className={`save-btn ${hasUnsavedChanges ? 'has-changes' : ''}`}
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            title="Save changes (Ctrl+S)"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="suggestions-dropdown"
          style={{
            position: 'fixed',
            top: suggestionPosition.top,
            left: suggestionPosition.left,
            zIndex: 1000
          }}
        >
          <div className="suggestions-header">
            <span>Markdown Suggestions ({selectedSuggestionIndex + 1}/{suggestions.length})</span>
            <span className="suggestion-hint">↑↓ to navigate, Enter/Tab to select, Esc to close</span>
          </div>
          <div className="suggestions-list" ref={suggestionsListRef}>
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.label}-${index}`}
                className={`suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                onClick={() => insertSuggestion(suggestion)}
                onMouseEnter={() => setSelectedSuggestionIndex(index)}
                style={{
                  backgroundColor: index === selectedSuggestionIndex ? 'var(--color-primary-light)' : 'transparent'
                }}
              >
                <div className="suggestion-label">{suggestion.label}</div>
                <div className="suggestion-value">{suggestion.value}</div>
                <div className="suggestion-description">{suggestion.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-message">{toast.message}</span>
          <button 
            className="toast-close"
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default MarkdownEditor
