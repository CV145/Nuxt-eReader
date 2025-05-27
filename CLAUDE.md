# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start development server at http://localhost:3000
npm run build      # Build for production
npm run generate   # Generate static site
npm run preview    # Preview production build
```

### Installation
```bash
npm install        # Install all dependencies
```

## Architecture Overview

This is a Nuxt 3 EPUB reader application with a custom-built EPUB parser and notebook functionality.

### Core Architecture
- **EPUB Parser**: Custom implementation in `utils/epub/EpubParser.js` that handles ZIP extraction, OPF/NCX parsing, and resource management
- **State Management**: Vue 3 Composition API with singleton composables:
  - `composables/useEpubReader.js`: EPUB parsing, chapter navigation, reader state
  - `composables/useNotebook.js`: Note-taking with localStorage persistence
- **Component Structure**: Modular Vue components with clear separation of concerns

### Key Technical Details
1. **EPUB Processing**: Files are processed client-side using JSZip for extraction and xml2js for XML parsing
2. **Paragraph Numbering**: Dynamic DOM manipulation adds numbered badges to paragraphs (`utils/parser/paragraphNumbering.js`)
3. **Storage**: All data persisted in localStorage (no server/database)
4. **Navigation**: Chapter-based with TOC support, keyboard shortcuts for navigation

### Important Files
- `components/reader/EpubReader.vue`: Main reader component with all controls
- `utils/epub/EpubParser.js`: Core EPUB parsing logic
- `pages/index.vue`: Application entry point with file upload
- `app.vue`: Root component with gradient background

### Dependencies to Note
- **JSZip 3.10.1**: ZIP file handling for EPUB extraction
- **xml2js 0.6.2**: XML parsing for EPUB metadata files
- **Nuxt 3.17.4**: Framework foundation