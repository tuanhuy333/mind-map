import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './ContentViewer.css'

function ContentViewer({ content, activeSection }) {
  const contentRef = useRef(null)

  useEffect(() => {
    if (activeSection && contentRef.current) {
      // Find the corresponding heading in the rendered content
      const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
      
      // Clean the activeSection text by removing markdown formatting
      const cleanActiveText = activeSection.text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold** formatting
        .replace(/\*(.*?)\*/g, '$1')     // Remove *italic* formatting
        .replace(/`(.*?)`/g, '$1')       // Remove `code` formatting
        .trim()
      
      // Try multiple matching strategies
      let targetHeading = Array.from(headings).find(heading => {
        const text = heading.textContent.trim()
        return text === cleanActiveText
      })
      
      // If exact match fails, try with original text
      if (!targetHeading) {
        targetHeading = Array.from(headings).find(heading => {
          const text = heading.textContent.trim()
          return text === activeSection.text
        })
      }
      
      // If still no match, try partial match with cleaned text
      if (!targetHeading) {
        targetHeading = Array.from(headings).find(heading => {
          const text = heading.textContent.trim()
          return text.includes(cleanActiveText) || cleanActiveText.includes(text)
        })
      }
      
      // If still no match, try case-insensitive match
      if (!targetHeading) {
        targetHeading = Array.from(headings).find(heading => {
          const text = heading.textContent.trim().toLowerCase()
          return text === cleanActiveText.toLowerCase()
        })
      }

      if (targetHeading) {
        // Remove previous highlights
        headings.forEach(h => h.classList.remove('active-section'))
        
        // Highlight the active section
        targetHeading.classList.add('active-section')
        
        // Scroll to the section
        targetHeading.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      } else {
        console.log('Could not find heading for:', activeSection.text)
        console.log('Cleaned text:', cleanActiveText)
        console.log('Available headings:', Array.from(headings).map(h => h.textContent.trim()))
      }
    }
  }, [activeSection])

  const processContent = (content) => {
    if (!content) return ''
    
    // Add table of contents based on headings
    const lines = content.split('\n')
    const headings = []
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('#')) {
        const level = (trimmedLine.match(/^#+/) || [''])[0].length
        const text = trimmedLine.replace(/^#+\s*/, '')
        headings.push({ level, text, line: index })
      }
    })

    // Generate table of contents
    let toc = ''
    if (headings.length > 0) {
      toc = '## Table of Contents\n\n'
      headings.forEach(heading => {
        const indent = '  '.repeat(heading.level - 1)
        toc += `${indent}- [${heading.text}](#${heading.text.toLowerCase().replace(/\s+/g, '-')})\n`
      })
      toc += '\n---\n\n'
    }

    return toc + content
  }

  return (
    <div className="content-viewer">
      <div className="viewer-content" ref={contentRef}>
        {content ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children, ...props }) => (
                <h1 className="content-h1" {...props}>
                  {children}
                </h1>
              ),
              h2: ({ children, ...props }) => (
                <h2 className="content-h2" {...props}>
                  {children}
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3 className="content-h3" {...props}>
                  {children}
                </h3>
              ),
              h4: ({ children, ...props }) => (
                <h4 className="content-h4" {...props}>
                  {children}
                </h4>
              ),
              h5: ({ children, ...props }) => (
                <h5 className="content-h5" {...props}>
                  {children}
                </h5>
              ),
              h6: ({ children, ...props }) => (
                <h6 className="content-h6" {...props}>
                  {children}
                </h6>
              ),
              p: ({ children, ...props }) => (
                <p className="content-p" {...props}>
                  {children}
                </p>
              ),
              ul: ({ children, ...props }) => (
                <ul className="content-ul" {...props}>
                  {children}
                </ul>
              ),
              ol: ({ children, ...props }) => (
                <ol className="content-ol" {...props}>
                  {children}
                </ol>
              ),
              li: ({ children, ...props }) => (
                <li className="content-li" {...props}>
                  {children}
                </li>
              ),
              blockquote: ({ children, ...props }) => (
                <blockquote className="content-blockquote" {...props}>
                  {children}
                </blockquote>
              ),
              code: ({ children, ...props }) => (
                <code className="content-code" {...props}>
                  {children}
                </code>
              ),
              pre: ({ children, ...props }) => (
                <pre className="content-pre" {...props}>
                  {children}
                </pre>
              ),
              table: ({ children, ...props }) => (
                <div className="table-wrapper">
                  <table className="content-table" {...props}>
                    {children}
                  </table>
                </div>
              ),
              th: ({ children, ...props }) => (
                <th className="content-th" {...props}>
                  {children}
                </th>
              ),
              td: ({ children, ...props }) => (
                <td className="content-td" {...props}>
                  {children}
                </td>
              ),
            }}
          >
            {processContent(content)}
          </ReactMarkdown>
        ) : (
          <div className="empty-content">
            <p>No content to display</p>
            <p>Start writing in the editor to see the rendered content here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentViewer
