<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="hero-content">
        <Icon name="book" :size="64" class="hero-icon" />
        <h1>Nuxt eReader</h1>
        <p class="tagline">A modern EPUB reader built with Nuxt.js</p>
        
        <div class="cta-buttons">
          <NuxtLink to="/library" class="btn-primary">
            <Icon name="book-open" />
            Go to Library
          </NuxtLink>
          <NuxtLink to="/library?upload=true" class="btn-secondary">
            <Icon name="upload" />
            Upload Book
          </NuxtLink>
        </div>
      </div>
      
      <div class="features-section">
        <h2>Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <Icon name="book-open" :size="32" />
            <h3>EPUB Support</h3>
            <p>Load and read EPUB files with full formatting support</p>
          </div>
          <div class="feature-card">
            <Icon name="hash" :size="32" />
            <h3>Paragraph Numbering</h3>
            <p>Toggle paragraph numbers for easy reference and navigation</p>
          </div>
          <div class="feature-card">
            <Icon name="list" :size="32" />
            <h3>Table of Contents</h3>
            <p>Navigate through chapters with an interactive table of contents</p>
          </div>
          <div class="feature-card">
            <Icon name="edit" :size="32" />
            <h3>Note Taking</h3>
            <p>Take notes while reading with our integrated notebook feature</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Icon from '~/components/ui/Icon.vue'

// Page meta
useHead({
  title: 'Nuxt eReader - Modern EPUB Reader',
  meta: [
    { name: 'description', content: 'A modern EPUB reader built with Nuxt.js featuring paragraph numbering, note-taking, and table of contents navigation.' }
  ]
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.hero-section {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-content {
  text-align: center;
  color: white;
  padding: 4rem 0;
}

.hero-icon {
  margin-bottom: 2rem;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.hero-content h1 {
  font-size: 4rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tagline {
  font-size: 1.5rem;
  opacity: 0.9;
  margin: 0 0 3rem 0;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  font-weight: 500;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.features-section {
  margin-top: 6rem;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 2rem;
}

.features-section h2 {
  text-align: center;
  color: white;
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  color: white;
  transition: transform 0.2s, background 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.15);
}

.feature-card svg {
  margin-bottom: 1rem;
  opacity: 0.9;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.feature-card p {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 3rem;
  }
  
  .tagline {
    font-size: 1.25rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  
  .features-section {
    margin-top: 4rem;
    padding: 3rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .home-page {
    padding: 1rem;
  }
  
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .hero-content {
    padding: 3rem 0;
  }
}
</style>