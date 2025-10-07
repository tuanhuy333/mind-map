import { useState, useRef, useEffect } from 'react'
import './MarkdownEditor.css'

function MarkdownEditor({ content, onContentChange, activeSection }) {
  const [localContent, setLocalContent] = useState(content)
  const textareaRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    setLocalContent(content)
  }, [content])

  useEffect(() => {
    if (activeSection && activeSection.lineNumber !== undefined) {
      scrollToSection(activeSection.lineNumber)
    }
  }, [activeSection])

  const handleChange = (e) => {
    const newContent = e.target.value
    setLocalContent(newContent)
    setIsTyping(true)
    
    // Debounce the save operation
    clearTimeout(window.saveTimeout)
    window.saveTimeout = setTimeout(() => {
      onContentChange(newContent)
      setIsTyping(false)
    }, 500)
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
    // Auto-indent for lists
    if (e.key === 'Enter') {
      const textarea = e.target
      const cursorPos = textarea.selectionStart
      const textBefore = textarea.value.substring(0, cursorPos)
      const lines = textBefore.split('\n')
      const currentLine = lines[lines.length - 1]
      
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
          {isTyping && <span className="typing-indicator">Saving...</span>}
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
              onContentChange(newText)
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
              onContentChange(newText)
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
              onContentChange(newText)
            }}
            title="Heading"
          >
            H1
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
- List item 2

## Subtopic 2
More content here..."
        className="editor-textarea"
      />
      
      <div className="editor-footer">
        <div className="word-count">
          Words: {localContent.split(/\s+/).filter(word => word.length > 0).length}
        </div>
        <div className="line-count">
          Lines: {localContent.split('\n').length}
        </div>
      </div>
    </div>
  )
}

export default MarkdownEditor
