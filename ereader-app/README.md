# Nuxt eReader

A modern, feature-rich EPUB reader built with Nuxt.js and JavaScript. This application provides a clean, intuitive interface for reading EPUB books with advanced features like paragraph numbering and table of contents navigation.

## Features

### 📚 EPUB Support
- **Complete EPUB parsing**: Custom-built EPUB parser from scratch
- **Metadata extraction**: Automatically extracts book title, author, publisher, and other metadata
- **Chapter navigation**: Navigate through book chapters with previous/next controls
- **Table of contents**: Interactive TOC with nested chapter support
- **Image support**: Displays embedded images with proper formatting

### 🔢 Paragraph Numbering
- **Toggle functionality**: Enable/disable paragraph numbering with a single click
- **Visual indicators**: Clean, numbered badges for each paragraph
- **Chapter-specific**: Paragraph numbers reset for each chapter
- **Responsive design**: Numbers adapt to different screen sizes

### 🎨 Modern UI/UX
- **Responsive design**: Works seamlessly on desktop, tablet, and mobile devices
- **Clean interface**: Minimalist design focused on reading experience
- **Smooth animations**: Polished transitions and loading states
- **Accessibility**: Keyboard navigation and screen reader support

### 🏗️ Technical Architecture
- **Modular codebase**: Well-organized component structure
- **Custom EPUB parser**: Built from scratch using JavaScript
- **Vue 3 Composition API**: Modern reactive programming patterns
- **TypeScript ready**: Structured for easy TypeScript migration

## Project Structure

```
ereader-app/
├── components/
│   ├── reader/
│   │   ├── EpubReader.vue          # Main reader component
│   │   ├── TableOfContents.vue     # TOC navigation
│   │   └── TocItem.vue             # Individual TOC items
│   └── ui/
│       ├── FileUpload.vue          # File upload interface
│       └── Icon.vue                # SVG icon component
├── composables/
│   └── useEpubReader.js            # Reader state management
├── pages/
│   └── index.vue                   # Main application page
├── utils/
│   ├── epub/
│   │   ├── constants.js            # EPUB-related constants
│   │   └── EpubParser.js           # Core EPUB parsing logic
│   └── parser/
│       └── paragraphNumbering.js   # Paragraph numbering utilities
└── assets/
    └── css/                        # Global styles
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ereader-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## Usage

### Loading an EPUB File
1. On the welcome screen, either:
   - Drag and drop an EPUB file onto the upload area
   - Click the upload area to browse and select an EPUB file
2. Click "Load Book" to parse and open the book

### Reading Features
- **Navigation**: Use Previous/Next buttons to move between chapters
- **Paragraph Numbers**: Click the "Paragraph Numbers" button to toggle numbering
- **Table of Contents**: Click the "Table of Contents" button to open the navigation menu
- **Vertical Scrolling**: Scroll through each chapter content vertically

### Keyboard Shortcuts
- `←` / `→`: Navigate between chapters
- `Esc`: Close table of contents modal

## Technical Details

### EPUB Parser
The custom EPUB parser handles:
- **ZIP extraction**: Uses JSZip to extract EPUB contents
- **XML parsing**: Parses OPF, NCX, and XHTML files
- **Metadata extraction**: Extracts Dublin Core metadata
- **Resource resolution**: Resolves relative paths for images and stylesheets
- **Content processing**: Sanitizes and processes chapter HTML

### Paragraph Numbering
- **DOM manipulation**: Uses DOMParser to identify paragraph elements
- **Dynamic insertion**: Adds numbered spans to paragraph beginnings
- **State management**: Tracks numbering state across chapter changes
- **Performance optimized**: Efficient DOM updates without full re-renders

### State Management
- **Composable pattern**: Uses Vue 3 Composition API for state management
- **Reactive updates**: Automatic UI updates when state changes
- **Error handling**: Comprehensive error states and user feedback
- **Loading states**: Visual feedback during async operations

## Dependencies

### Core Dependencies
- **Nuxt.js 3**: Vue.js framework for production
- **Vue 3**: Progressive JavaScript framework
- **JSZip**: JavaScript library for creating, reading and editing .zip files
- **xml2js**: XML to JavaScript object converter

### Development Dependencies
- **Vite**: Fast build tool and development server
- **PostCSS**: CSS transformation tool
- **ESLint**: JavaScript linting utility

## Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Features used**: ES2020, CSS Grid, Flexbox, File API, DOMParser

## Performance Considerations

- **Lazy loading**: Chapters are loaded on-demand
- **Memory management**: Efficient handling of large EPUB files
- **Image optimization**: Base64 encoding for embedded images
- **CSS scoping**: Isolated styles prevent conflicts
- **Bundle optimization**: Tree-shaking and code splitting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- EPUB specification by IDPF/W3C
- Vue.js and Nuxt.js communities
- Open source contributors

## Future Enhancements

- [ ] Bookmarking system
- [ ] Reading progress tracking
- [ ] Font size and theme customization
- [ ] Search functionality
- [ ] Annotation support
- [ ] Multiple book library
- [ ] Reading statistics
- [ ] Export/sharing features 