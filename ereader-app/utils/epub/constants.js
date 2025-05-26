// EPUB namespace constants
export const NAMESPACES = {
  CONTAINER: 'urn:oasis:names:tc:opendocument:xmlns:container',
  OPF: 'http://www.idpf.org/2007/opf',
  DC: 'http://purl.org/dc/elements/1.1/',
  XHTML: 'http://www.w3.org/1999/xhtml'
}

// EPUB file paths
export const EPUB_PATHS = {
  MIMETYPE: 'mimetype',
  CONTAINER: 'META-INF/container.xml',
  CONTENT_OPF: 'content.opf'
}

// MIME types
export const MIME_TYPES = {
  EPUB: 'application/epub+zip',
  XHTML: 'application/xhtml+xml',
  CSS: 'text/css',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_GIF: 'image/gif',
  IMAGE_SVG: 'image/svg+xml'
}

// File extensions
export const FILE_EXTENSIONS = {
  XHTML: ['.xhtml', '.html', '.htm'],
  CSS: ['.css'],
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.svg']
} 