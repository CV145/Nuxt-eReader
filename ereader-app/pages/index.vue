<template>
  <div class="ereader-app">
    <!-- Welcome Screen -->
    <div v-if="!isBookLoaded" class="welcome-screen">
      <div class="welcome-content">
        <div class="app-header">
          <Icon name="book" :size="48" class="app-icon" />
          <h1>Nuxt eReader</h1>
          <p>A modern EPUB reader built with Nuxt.js</p>
        </div>
        
        <FileUpload
          :is-loading="isLoading"
          :error="error"
          @file-selected="handleFileSelected"
          @load-file="handleLoadFile"
        />
        
        <div class="features">
          <div class="feature">
            <Icon name="book-open" />
            <h3>EPUB Support</h3>
            <p>Load and read EPUB files with full formatting support</p>
          </div>
          <div class="feature">
            <Icon name="hash" />
            <h3>Paragraph Numbering</h3>
            <p>Toggle paragraph numbers for easy reference and navigation</p>
          </div>
          <div class="feature">
            <Icon name="list" />
            <h3>Table of Contents</h3>
            <p>Navigate through chapters with an interactive table of contents</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Reader Interface -->
    <div v-else class="reader-interface">
      <EpubReader @show-toc="showToc = true" />
      
      <!-- Table of Contents Modal -->
      <div v-if="showToc" class="toc-modal" @click="showToc = false">
        <div class="toc-container" @click.stop>
          <TableOfContents
            :toc="toc"
            :current-chapter-index="currentChapterIndex"
            @close="showToc = false"
            @navigate="handleTocNavigate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useEpubReader } from '~/composables/useEpubReader'
import FileUpload from '~/components/ui/FileUpload.vue'
import Icon from '~/components/ui/Icon.vue'
import EpubReader from '~/components/reader/EpubReader.vue'
import TableOfContents from '~/components/reader/TableOfContents.vue'

// Page meta
useHead({
  title: 'Nuxt eReader - Modern EPUB Reader',
  meta: [
    { name: 'description', content: 'A modern EPUB reader built with Nuxt.js featuring paragraph numbering and table of contents navigation.' }
  ]
})

// State
const showToc = ref(false)
const selectedFile = ref(null)

// Use the EPUB reader composable
const {
  isLoading,
  error,
  isBookLoaded,
  toc,
  currentChapterIndex,
  loadEpub,
  goToHref
} = useEpubReader()

// Methods
const handleFileSelected = (file) => {
  selectedFile.value = file
}

const handleLoadFile = async (file) => {
  await loadEpub(file)
}

const handleTocNavigate = async (href) => {
  await goToHref(href)
  showToc.value = false
}
</script>

<style scoped>
.ereader-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.welcome-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

.welcome-content {
  max-width: 800px;
  width: 100%;
}

.app-header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.app-icon {
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.app-header h1 {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header p {
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature svg {
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.feature h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.feature p {
  font-size: 0.875rem;
  opacity: 0.8;
  margin: 0;
  line-height: 1.5;
}

.reader-interface {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.toc-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.toc-container {
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Responsive design */
@media (max-width: 768px) {
  .welcome-screen {
    padding: 1rem;
  }
  
  .app-header h1 {
    font-size: 2.5rem;
  }
  
  .features {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 2rem;
  }
  
  .feature {
    padding: 1.5rem;
  }
  
  .toc-modal {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .app-header h1 {
    font-size: 2rem;
  }
  
  .app-header p {
    font-size: 1rem;
  }
}
</style> 