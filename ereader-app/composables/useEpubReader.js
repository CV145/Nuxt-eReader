import { ref, computed } from 'vue'
import { EpubParser } from '~/utils/epub/EpubParser'
import { processParagraphNumbering } from '~/utils/parser/paragraphNumbering'

// Create singleton state outside the composable
const parser = ref(null)
const isLoading = ref(false)
const error = ref(null)
const metadata = ref({})
const toc = ref([])
const currentChapterIndex = ref(0)
const currentChapter = ref(null)
const totalChapters = ref(0)
const showParagraphNumbers = ref(false)

export const useEpubReader = () => {
  // Computed
  const isBookLoaded = computed(() => parser.value !== null)
  
  const hasNextChapter = computed(() => 
    currentChapterIndex.value < totalChapters.value - 1
  )
  
  const hasPreviousChapter = computed(() => 
    currentChapterIndex.value > 0
  )

  const processedChapterContent = computed(() => {
    console.log('Computing processedChapterContent...')
    console.log('currentChapter.value:', currentChapter.value)
    console.log('currentChapter.value?.content:', currentChapter.value?.content)
    console.log('currentChapter.value?.content?.html:', currentChapter.value?.content?.html)
    
    if (!currentChapter.value?.content?.html) {
      console.log('No chapter content HTML found')
      return ''
    }
    
    const processed = processParagraphNumbering(
      currentChapter.value.content.html,
      showParagraphNumbers.value
    )
    
    console.log('Processed content length:', processed.length)
    console.log('Processed content preview:', processed.substring(0, 200))
    
    return processed
  })

  // Methods
  const loadEpub = async (file) => {
    console.log('Starting EPUB load for file:', file.name, file.size, 'bytes')
    isLoading.value = true
    error.value = null
    
    try {
      console.log('Creating EPUB parser...')
      parser.value = new EpubParser()
      
      console.log('Parsing EPUB file...')
      const epubData = await parser.value.parse(file)
      console.log('EPUB parsed successfully:', epubData)
      
      metadata.value = epubData.metadata
      toc.value = epubData.toc
      totalChapters.value = parser.value.getChapterCount()
      
      console.log('Total chapters found:', totalChapters.value)
      
      // Load first chapter
      if (totalChapters.value > 0) {
        console.log('Loading first chapter...')
        await loadChapter(0)
        // loadChapter will handle setting isLoading to false
      } else {
        error.value = 'No chapters found in this EPUB file'
        isLoading.value = false
      }
    } catch (err) {
      console.error('Failed to load EPUB:', err)
      error.value = `Failed to load EPUB: ${err.message}`
      parser.value = null
      isLoading.value = false
    }
  }

  const loadChapter = async (index) => {
    console.log('Loading chapter:', index)
    if (!parser.value || index < 0 || index >= totalChapters.value) {
      console.error('Invalid chapter index or no parser:', { index, totalChapters: totalChapters.value, hasParser: !!parser.value })
      return
    }
    
    // Don't set isLoading if we're already loading from loadEpub
    if (!isLoading.value) {
      isLoading.value = true
    }
    error.value = null
    
    try {
      console.log('Getting chapter from parser...')
      const chapterData = await parser.value.getChapter(index)
      console.log('Raw chapter data received:', chapterData)
      
      // Set the chapter data
      currentChapter.value = chapterData
      currentChapterIndex.value = index
      
      console.log('Chapter loaded successfully:', currentChapter.value?.title)
      console.log('currentChapter.value after assignment:', currentChapter.value)
      console.log('Chapter content structure:', {
        hasContent: !!currentChapter.value?.content,
        hasHtml: !!currentChapter.value?.content?.html,
        htmlLength: currentChapter.value?.content?.html?.length,
        htmlPreview: currentChapter.value?.content?.html?.substring(0, 200)
      })
      
    } catch (err) {
      console.error('Failed to load chapter:', err)
      error.value = `Failed to load chapter: ${err.message}`
    } finally {
      isLoading.value = false
      console.log('loadChapter completed, isLoading set to false')
    }
  }

  const nextChapter = async () => {
    if (hasNextChapter.value) {
      await loadChapter(currentChapterIndex.value + 1)
    }
  }

  const previousChapter = async () => {
    if (hasPreviousChapter.value) {
      await loadChapter(currentChapterIndex.value - 1)
    }
  }

  const goToChapter = async (index) => {
    await loadChapter(index)
  }

  const findChapterIndexByHref = (href) => {
    if (!parser.value || !href) return -1
    const cleanHref = href.split('#')[0]
    return parser.value.spine.findIndex(item => {
      if (!item || !item.href) return false
      const itemHref = item.href.split('#')[0]
      return itemHref === cleanHref
    })
  }

  const goToHref = async (href) => {
    const index = findChapterIndexByHref(href)
    if (index !== -1) {
      await loadChapter(index)
    } else {
      console.warn('Chapter not found for href:', href)
    }
  }

  const toggleParagraphNumbers = () => {
    showParagraphNumbers.value = !showParagraphNumbers.value
  }

  const reset = () => {
    parser.value = null
    isLoading.value = false
    error.value = null
    metadata.value = {}
    toc.value = []
    currentChapterIndex.value = 0
    currentChapter.value = null
    totalChapters.value = 0
    showParagraphNumbers.value = false
  }

  return {
    // State
    parser: computed(() => parser.value),
    isLoading,
    error,
    metadata,
    toc,
    currentChapterIndex,
    currentChapter,
    totalChapters,
    showParagraphNumbers,
    
    // Computed
    isBookLoaded,
    hasNextChapter,
    hasPreviousChapter,
    processedChapterContent,
    
    // Methods
    loadEpub,
    loadChapter,
    nextChapter,
    previousChapter,
    goToChapter,
    goToHref,
    toggleParagraphNumbers,
    reset
  }
}