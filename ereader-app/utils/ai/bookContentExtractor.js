/**
 * Extract and prepare book content for AI context
 */

/**
 * Extract all text content from the book
 * @param {Object} parser - The EPUB parser instance
 * @returns {Promise<Object>} Extracted content and metadata
 */
export async function extractFullBookContent(parser) {
  if (!parser) {
    throw new Error('No parser instance provided')
  }

  const bookContent = {
    metadata: parser.metadata || {},
    chapters: [],
    fullText: '',
    summary: ''
  }

  try {
    // Extract content from all chapters
    const chapterCount = parser.getChapterCount()
    
    for (let i = 0; i < chapterCount; i++) {
      const chapter = await parser.getChapter(i)
      
      if (chapter && chapter.content && chapter.content.html) {
        // Strip HTML tags to get plain text
        const plainText = stripHtmlTags(chapter.content.html)
        
        const chapterData = {
          index: i,
          title: chapter.title || `Chapter ${i + 1}`,
          content: plainText,
          wordCount: countWords(plainText)
        }
        
        bookContent.chapters.push(chapterData)
        bookContent.fullText += `\n\n--- ${chapterData.title} ---\n\n${plainText}`
      }
    }

    // Calculate total word count
    bookContent.totalWordCount = bookContent.chapters.reduce(
      (sum, ch) => sum + ch.wordCount, 
      0
    )

    // Create a condensed summary for very large books
    bookContent.summary = createBookSummary(bookContent)

    return bookContent
  } catch (error) {
    console.error('Failed to extract book content:', error)
    throw error
  }
}

/**
 * Strip HTML tags from content
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
function stripHtmlTags(html) {
  // Remove script and style elements
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  
  // Replace common block elements with line breaks
  text = text.replace(/<\/?(p|div|br|h[1-6])[^>]*>/gi, '\n')
  
  // Remove all remaining tags
  text = text.replace(/<[^>]+>/g, '')
  
  // Decode HTML entities
  text = decodeHtmlEntities(text)
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ')
  text = text.replace(/\n\s*\n/g, '\n\n')
  
  return text.trim()
}

/**
 * Decode common HTML entities
 * @param {string} text - Text with HTML entities
 * @returns {string} Decoded text
 */
function decodeHtmlEntities(text) {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '…',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsquo;': "'",
    '&rsquo;': "'"
  }
  
  return text.replace(/&[a-z]+;/gi, match => entities[match] || match)
}

/**
 * Count words in text
 * @param {string} text - Plain text
 * @returns {number} Word count
 */
function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Create a condensed summary for large books
 * @param {Object} bookContent - Full book content
 * @returns {string} Summary text
 */
function createBookSummary(bookContent) {
  const maxSummaryLength = 10000 // Characters
  let summary = `Book: ${bookContent.metadata.title || 'Unknown'}\n`
  summary += `Author: ${bookContent.metadata.author || 'Unknown'}\n`
  summary += `Total Chapters: ${bookContent.chapters.length}\n`
  summary += `Total Words: ${bookContent.totalWordCount}\n\n`
  
  // Add chapter summaries
  summary += 'Chapter Overview:\n'
  
  for (const chapter of bookContent.chapters) {
    summary += `\n${chapter.title}:\n`
    
    // Add first 200 characters of each chapter
    const preview = chapter.content.substring(0, 200).replace(/\s+/g, ' ')
    summary += `${preview}...\n`
    
    if (summary.length > maxSummaryLength) {
      summary += '\n[Additional chapters omitted for brevity]'
      break
    }
  }
  
  return summary
}

/**
 * Create context for AI based on book size
 * @param {Object} bookContent - Full book content
 * @param {Object} options - Context options
 * @returns {string} AI context
 */
export function createAIContext(bookContent, options = {}) {
  const {
    currentChapterIndex = 0,
    includeFullText = false,
    maxContextLength = 100000 // ~25k tokens
  } = options

  let context = ''
  
  // Always include metadata
  context += `Book Title: ${bookContent.metadata.title || 'Unknown'}\n`
  context += `Author: ${bookContent.metadata.author || 'Unknown'}\n`
  context += `Total Chapters: ${bookContent.chapters.length}\n`
  context += `Total Words: ${bookContent.totalWordCount}\n\n`

  // For smaller books, include full text
  if (includeFullText && bookContent.fullText.length < maxContextLength) {
    context += 'Full Book Content:\n'
    context += bookContent.fullText
  } 
  // For larger books, use intelligent context selection
  else {
    context += 'Book Summary:\n'
    context += bookContent.summary + '\n\n'
    
    // Include current chapter and surrounding chapters
    const contextRadius = 2 // Chapters before and after current
    const startChapter = Math.max(0, currentChapterIndex - contextRadius)
    const endChapter = Math.min(
      bookContent.chapters.length - 1, 
      currentChapterIndex + contextRadius
    )
    
    context += `\nRelevant Chapters (${startChapter + 1} to ${endChapter + 1}):\n`
    
    for (let i = startChapter; i <= endChapter; i++) {
      const chapter = bookContent.chapters[i]
      if (chapter) {
        context += `\n--- ${chapter.title} ---\n`
        
        if (i === currentChapterIndex) {
          // Include full current chapter
          context += chapter.content + '\n'
        } else {
          // Include first 1000 characters of surrounding chapters
          context += chapter.content.substring(0, 1000) + '...\n'
        }
      }
    }
  }
  
  return context
}

/**
 * Check if book content should be updated
 * @param {Object} existingContent - Existing extracted content
 * @param {Object} parser - Current parser instance
 * @returns {boolean} Whether content needs updating
 */
export function shouldUpdateBookContent(existingContent, parser) {
  if (!existingContent) return true
  
  // Check if chapter count changed
  const currentChapterCount = parser.getChapterCount()
  if (existingContent.chapters?.length !== currentChapterCount) {
    return true
  }
  
  // Check if metadata changed
  const currentMetadata = parser.metadata || {}
  const existingMetadata = existingContent.metadata || {}
  
  if (currentMetadata.title !== existingMetadata.title ||
      currentMetadata.author !== existingMetadata.author) {
    return true
  }
  
  return false
}