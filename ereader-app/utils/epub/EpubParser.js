import JSZip from 'jszip'
import xml2js from 'xml2js'
import { NAMESPACES, EPUB_PATHS, FILE_EXTENSIONS } from './constants'

export class EpubParser {
  constructor() {
    this.zip = null
    this.metadata = {}
    this.manifest = {}
    this.spine = []
    this.toc = []
    this.resources = {}
    this.rootPath = ''
  }

  /**
   * Load and parse an EPUB file
   * @param {File|Blob|ArrayBuffer} file - The EPUB file to parse
   * @returns {Promise<Object>} Parsed EPUB data
   */
  async parse(file) {
    try {
      console.log('EpubParser: Starting parse...')
      
      // Load the EPUB file as a zip
      console.log('EpubParser: Loading ZIP...')
      this.zip = await JSZip.loadAsync(file)
      console.log('EpubParser: ZIP loaded, files:', Object.keys(this.zip.files))
      
      // Verify it's a valid EPUB
      console.log('EpubParser: Verifying EPUB...')
      await this.verifyEpub()
      
      // Parse the container to find the OPF file
      console.log('EpubParser: Parsing container...')
      const opfPath = await this.parseContainer()
      console.log('EpubParser: OPF path found:', opfPath)
      
      // Parse the OPF file
      console.log('EpubParser: Parsing OPF...')
      await this.parseOpf(opfPath)
      console.log('EpubParser: OPF parsed, spine length:', this.spine.length)
      
      // Parse the table of contents
      console.log('EpubParser: Parsing TOC...')
      await this.parseToc()
      console.log('EpubParser: TOC parsed, items:', this.toc.length)
      
      return {
        metadata: this.metadata,
        spine: this.spine,
        toc: this.toc,
        manifest: this.manifest
      }
    } catch (error) {
      console.error('EpubParser: Parse error:', error)
      throw new Error(`Failed to parse EPUB: ${error.message}`)
    }
  }

  /**
   * Verify the EPUB file is valid
   */
  async verifyEpub() {
    const mimetypeFile = this.zip.file(EPUB_PATHS.MIMETYPE)
    if (!mimetypeFile) {
      throw new Error('Invalid EPUB: Missing mimetype file')
    }
    
    const mimetype = await mimetypeFile.async('string')
    if (mimetype.trim() !== 'application/epub+zip') {
      throw new Error('Invalid EPUB: Incorrect mimetype')
    }
  }

  /**
   * Parse the container.xml file to find the OPF file path
   */
  async parseContainer() {
    const containerFile = this.zip.file(EPUB_PATHS.CONTAINER)
    if (!containerFile) {
      throw new Error('Invalid EPUB: Missing container.xml')
    }
    
    const containerXml = await containerFile.async('string')
    const container = await xml2js.parseStringPromise(containerXml)
    
    const rootfiles = container.container?.rootfiles?.[0]?.rootfile
    if (!rootfiles || rootfiles.length === 0) {
      throw new Error('Invalid EPUB: No rootfile found in container.xml')
    }
    
    const opfPath = rootfiles[0].$['full-path']
    this.rootPath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1)
    
    return opfPath
  }

  /**
   * Parse the OPF (Open Packaging Format) file
   */
  async parseOpf(opfPath) {
    const opfFile = this.zip.file(opfPath)
    if (!opfFile) {
      throw new Error(`Invalid EPUB: Missing OPF file at ${opfPath}`)
    }
    
    const opfXml = await opfFile.async('string')
    const opf = await xml2js.parseStringPromise(opfXml)
    
    const packageData = opf.package || opf['opf:package']
    if (!packageData) {
      throw new Error('Invalid EPUB: Invalid OPF structure')
    }
    
    // Parse metadata
    this.parseMetadata(packageData.metadata?.[0])
    
    // Parse manifest
    this.parseManifest(packageData.manifest?.[0])
    
    // Parse spine
    this.parseSpine(packageData.spine?.[0])
  }

  /**
   * Parse metadata from the OPF file
   */
  parseMetadata(metadata) {
    if (!metadata) return
    
    this.metadata = {
      title: this.getMetadataValue(metadata['dc:title']),
      author: this.getMetadataValue(metadata['dc:creator']),
      publisher: this.getMetadataValue(metadata['dc:publisher']),
      language: this.getMetadataValue(metadata['dc:language']),
      identifier: this.getMetadataValue(metadata['dc:identifier']),
      description: this.getMetadataValue(metadata['dc:description']),
      date: this.getMetadataValue(metadata['dc:date']),
      rights: this.getMetadataValue(metadata['dc:rights']),
      cover: this.findCoverImage(metadata)
    }
  }

  /**
   * Get metadata value from array or string
   */
  getMetadataValue(value) {
    if (!value) return null
    if (Array.isArray(value)) {
      return value[0]._ || value[0]
    }
    return value
  }

  /**
   * Find cover image from metadata
   */
  findCoverImage(metadata) {
    const meta = metadata.meta || []
    for (const item of meta) {
      if (item.$ && item.$.name === 'cover') {
        return item.$.content
      }
    }
    return null
  }

  /**
   * Parse manifest from the OPF file
   */
  parseManifest(manifest) {
    if (!manifest || !manifest.item) return
    
    manifest.item.forEach(item => {
      const id = item.$.id
      const href = this.rootPath + item.$.href
      const mediaType = item.$['media-type']
      
      this.manifest[id] = {
        id,
        href,
        mediaType,
        properties: item.$.properties || '',
        originalHref: item.$.href
      }
    })
  }

  /**
   * Parse spine from the OPF file
   */
  parseSpine(spine) {
    if (!spine || !spine.itemref) return
    
    const tocId = spine.$.toc
    
    this.spine = spine.itemref.map((item, index) => {
      const idref = item.$.idref
      const manifestItem = this.manifest[idref]
      
      return {
        index,
        idref,
        href: manifestItem?.href,
        mediaType: manifestItem?.mediaType,
        linear: item.$.linear !== 'no'
      }
    })
    
    // Store TOC reference
    if (tocId && this.manifest[tocId]) {
      this.tocPath = this.manifest[tocId].href
    }
  }

  /**
   * Parse table of contents
   */
  async parseToc() {
    if (!this.tocPath) {
      // Try to find TOC in manifest
      for (const item of Object.values(this.manifest)) {
        if (item.properties.includes('nav') || item.href.includes('toc')) {
          this.tocPath = item.href
          break
        }
      }
    }
    
    if (!this.tocPath) {
      console.warn('No table of contents found')
      return
    }
    
    const tocFile = this.zip.file(this.tocPath)
    if (!tocFile) {
      console.warn(`TOC file not found: ${this.tocPath}`)
      return
    }
    
    const tocContent = await tocFile.async('string')
    this.toc = await this.parseTocContent(tocContent)
  }

  /**
   * Parse TOC content (supports both NCX and XHTML navigation)
   */
  async parseTocContent(content) {
    try {
      // Try parsing as NCX first
      if (content.includes('ncx')) {
        return await this.parseNcxToc(content)
      } else {
        // Parse as XHTML navigation
        return await this.parseXhtmlToc(content)
      }
    } catch (error) {
      console.error('Failed to parse TOC:', error)
      return []
    }
  }

  /**
   * Parse NCX table of contents
   */
  async parseNcxToc(content) {
    const ncx = await xml2js.parseStringPromise(content)
    const navMap = ncx.ncx?.navMap?.[0]?.navPoint || []
    
    const parseTocItem = (navPoint) => {
      const label = navPoint.navLabel?.[0]?.text?.[0] || ''
      const href = this.rootPath + navPoint.content?.[0]?.$?.src || ''
      const children = navPoint.navPoint?.map(parseTocItem) || []
      
      return {
        label,
        href,
        children
      }
    }
    
    return navMap.map(parseTocItem)
  }

  /**
   * Parse XHTML navigation document
   */
  async parseXhtmlToc(content) {
    // Simple regex-based parsing for XHTML nav
    const navRegex = /<nav[^>]*epub:type="toc"[^>]*>([\s\S]*?)<\/nav>/i
    const navMatch = content.match(navRegex)
    
    if (!navMatch) return []
    
    const navContent = navMatch[1]
    const items = []
    
    // Parse list items
    const liRegex = /<li[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/li>/gi
    let match
    
    while ((match = liRegex.exec(navContent)) !== null) {
      const href = this.rootPath + match[1]
      const label = match[2].replace(/<[^>]*>/g, '').trim()
      
      items.push({
        label,
        href,
        children: []
      })
    }
    
    return items
  }

  /**
   * Get chapter content by spine index
   */
  async getChapter(index) {
    if (index < 0 || index >= this.spine.length) {
      throw new Error('Invalid chapter index')
    }
    
    const spineItem = this.spine[index]
    const file = this.zip.file(spineItem.href)
    
    if (!file) {
      throw new Error(`Chapter file not found: ${spineItem.href}`)
    }
    
    const content = await file.async('string')
    const processedContent = await this.processChapterContent(content, spineItem.href)
    
    return {
      index,
      title: this.findChapterTitle(index),
      content: processedContent,
      href: spineItem.href
    }
  }

  /**
   * Process chapter content (resolve relative paths, extract styles, etc.)
   */
  async processChapterContent(content, chapterPath) {
    const chapterDir = chapterPath.substring(0, chapterPath.lastIndexOf('/') + 1)
    
    // Extract and process styles
    const styles = await this.extractStyles(content, chapterDir)
    
    // Process HTML content
    let processedHtml = content
    
    // For now, skip image processing to avoid async issues
    // TODO: Implement proper async image processing
    
    // Extract body content
    const bodyMatch = processedHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    const bodyContent = bodyMatch ? bodyMatch[1] : processedHtml
    
    return {
      html: bodyContent,
      styles
    }
  }

  /**
   * Extract and process styles from chapter
   */
  async extractStyles(content, chapterDir) {
    const styles = []
    
    // Extract inline styles
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
    let match
    
    while ((match = styleRegex.exec(content)) !== null) {
      styles.push(match[1])
    }
    
    // Extract linked stylesheets
    const linkRegex = /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/gi
    
    while ((match = linkRegex.exec(content)) !== null) {
      const cssPath = this.resolvePath(chapterDir, match[1])
      const cssFile = this.zip.file(cssPath)
      
      if (cssFile) {
        const cssContent = await cssFile.async('string')
        styles.push(cssContent)
      }
    }
    
    return styles.join('\n')
  }

  /**
   * Resolve relative path
   */
  resolvePath(basePath, relativePath) {
    if (relativePath.startsWith('/')) {
      return relativePath.substring(1)
    }
    
    const baseSegments = basePath.split('/').filter(s => s)
    const relativeSegments = relativePath.split('/').filter(s => s)
    
    for (const segment of relativeSegments) {
      if (segment === '..') {
        baseSegments.pop()
      } else if (segment !== '.') {
        baseSegments.push(segment)
      }
    }
    
    return baseSegments.join('/')
  }

  /**
   * Extract cover image as base64 data URL
   */
  async extractCoverImage() {
    if (!this.metadata.cover || !this.manifest) return null
    
    try {
      const coverId = this.metadata.cover
      const coverItem = Object.values(this.manifest).find(item => 
        item.id === coverId || 
        item.properties.includes('cover-image') ||
        (item.mediaType && item.mediaType.startsWith('image/'))
      )
      
      if (!coverItem) return null
      
      const coverFile = this.zip.file(coverItem.href)
      if (!coverFile) return null
      
      const coverData = await coverFile.async('base64')
      const mimeType = coverItem.mediaType || 'image/jpeg'
      
      return `data:${mimeType};base64,${coverData}`
    } catch (error) {
      console.error('Failed to extract cover image:', error)
      return null
    }
  }

  /**
   * Get resource as data URL
   */
  getResourceDataUrl(path) {
    const file = this.zip.file(path)
    if (!file) return null
    
    // Determine MIME type from extension
    const ext = path.substring(path.lastIndexOf('.')).toLowerCase()
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    }
    
    const mimeType = mimeTypes[ext] || 'application/octet-stream'
    
    // Convert to base64 data URL synchronously (for now)
    // In a real app, you'd want to cache these
    return file.async('base64').then(data => `data:${mimeType};base64,${data}`)
  }

  /**
   * Find chapter title from TOC
   */
  findChapterTitle(index) {
    const spineItem = this.spine[index]
    if (!spineItem) return `Chapter ${index + 1}`
    
    // Search TOC for matching href
    const findInToc = (items, href) => {
      for (const item of items) {
        if (item.href === href || item.href.split('#')[0] === href) {
          return item.label
        }
        if (item.children && item.children.length > 0) {
          const found = findInToc(item.children, href)
          if (found) return found
        }
      }
      return null
    }
    
    const title = findInToc(this.toc, spineItem.href)
    return title || `Chapter ${index + 1}`
  }

  /**
   * Get total number of chapters
   */
  getChapterCount() {
    return this.spine.length
  }

  /**
   * Get book metadata
   */
  getMetadata() {
    return this.metadata
  }

  /**
   * Get table of contents
   */
  getTableOfContents() {
    return this.toc
  }
} 