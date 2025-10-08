import { useState, useRef, useEffect } from 'react'
import './MarkdownEditor.css'

function MarkdownEditor({ content, onContentChange, activeSection }) {
  const [localContent, setLocalContent] = useState(content)
  const textareaRef = useRef(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null)


  useEffect(() => {
    setLocalContent(content)
    setHasUnsavedChanges(false)
  }, [content])

  useEffect(() => {
    if (activeSection && activeSection.lineNumber !== undefined) {
      scrollToSection(activeSection.lineNumber)
    }
  }, [activeSection])


  const handleChange = (e) => {
    const newContent = e.target.value
    setLocalContent(newContent)
    setHasUnsavedChanges(newContent !== content)
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
