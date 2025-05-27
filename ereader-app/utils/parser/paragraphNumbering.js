/**
 * Add paragraph numbers to HTML content
 * @param {string} html - The HTML content to process
 * @param {boolean} enabled - Whether paragraph numbering is enabled
 * @param {Function} isBookmarkedCallback - Optional callback to check if paragraph is bookmarked
 * @returns {string} Processed HTML with or without paragraph numbers
 */
export function processParagraphNumbering(html, enabled, isBookmarkedCallback = null) {
  console.log('processParagraphNumbering called with enabled:', enabled, 'html length:', html.length)
  
  if (!enabled && !isBookmarkedCallback) {
    // Remove existing paragraph numbers and data attributes if disabled
    const result = html
      .replace(/<span class="paragraph-number">\[\d+\]<\/span>\s*/g, '')
      .replace(/ data-paragraph-number="\d+"/g, '')
      .replace(/<span class="bookmark-icon-inline">.*?<\/span>/g, '')
    console.log('Paragraph numbering disabled, returning original content')
    return result
  }

  try {
    // Parse the HTML to identify paragraphs
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    // Select all paragraph elements
    const paragraphs = doc.querySelectorAll('p')
    console.log('Found paragraphs:', paragraphs.length)
    
    let paragraphCount = 0
    
    paragraphs.forEach((p) => {
      // Skip empty paragraphs
      if (p.textContent.trim().length === 0) return
      
      // Check if paragraph already has a number
      const existingNumber = p.querySelector('.paragraph-number')
      if (existingNumber) {
        existingNumber.remove()
      }
      
      paragraphCount++
      
      // Create paragraph number element
      const numberSpan = doc.createElement('span')
      numberSpan.className = 'paragraph-number'
      numberSpan.textContent = `[${paragraphCount}]`
      
      // Insert at the beginning of the paragraph
      p.insertBefore(numberSpan, p.firstChild)
      p.insertBefore(doc.createTextNode(' '), p.childNodes[1])
      
      // add attribute for reference
      p.setAttribute('data-paragraph-number', paragraphCount.toString())
    })
    
    const result = doc.body.innerHTML
    console.log('Processed content with paragraph numbers, result length:', result.length)
    return result
  } catch (error) {
    console.error('Error processing paragraph numbering:', error)
    return html
  }
}

/**
 * Extract paragraph count from HTML content
 * @param {string} html - The HTML content to analyze
 * @returns {number} Number of paragraphs
 */
export function countParagraphs(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const paragraphs = doc.querySelectorAll('p')
  
  return Array.from(paragraphs).filter(p => p.textContent.trim().length > 0).length
} 