<template>
  <div class="home-page">
    <!-- Animated Background -->
    <div class="background-animation">
      <div class="gradient-sphere sphere-1"></div>
      <div class="gradient-sphere sphere-2"></div>
      <div class="gradient-sphere sphere-3"></div>
    </div>

    <!-- Navigation Header -->
    <header class="nav-header glass">
      <div class="nav-container">
        <div class="logo">
          <Icon name="book" :size="32" />
          <span class="logo-text gradient-text">Nuxt eReader</span>
        </div>
        <nav class="nav-links">
          <NuxtLink to="/library" class="nav-link">Library</NuxtLink>
          <NuxtLink to="/library?upload=true" class="nav-link nav-cta">
            <Icon name="upload" :size="18" />
            Upload
          </NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="hero-section">
      <div class="hero-content">
        <div class="hero-badge glass">
          <span>✨ Modern EPUB Reader</span>
        </div>
        
        <h1 class="hero-title">
          Your Digital Library,
          <span class="gradient-text">Beautifully Reimagined</span>
        </h1>
        
        <p class="hero-description">
          Experience reading like never before with our elegant EPUB reader. 
          Take notes, track progress, and enjoy your favorite books in style.
        </p>
        
        <div class="hero-actions">
          <NuxtLink to="/library" class="btn-hero-primary hover-lift">
            <Icon name="book-open" :size="20" />
            Open Library
          </NuxtLink>
          <NuxtLink to="/library?upload=true" class="btn-hero-secondary hover-glow">
            <Icon name="plus" :size="20" />
            Add Your First Book
          </NuxtLink>
        </div>

        <!-- Stats -->
        <div class="hero-stats">
          <div class="stat-item glass">
            <span class="stat-icon">📚</span>
            <span class="stat-text">EPUB Support</span>
          </div>
          <div class="stat-item glass">
            <span class="stat-icon">✍️</span>
            <span class="stat-text">Note Taking</span>
          </div>
          <div class="stat-item glass">
            <span class="stat-icon">🎯</span>
            <span class="stat-text">Reading Progress</span>
          </div>
        </div>
      </div>

      <!-- Feature Preview -->
      <div class="hero-preview">
        <div class="preview-card glass-white hover-lift">
          <div class="preview-mockup">
            <!-- Mockup Header -->
            <div class="mockup-header">
              <div class="mockup-controls">
                <div class="control-dot"></div>
                <div class="control-dot"></div>
                <div class="control-dot"></div>
              </div>
              <div class="mockup-title">Chapter 1: The Beginning</div>
            </div>
            
            <!-- Mockup Content -->
            <div class="mockup-content">
              <p class="mockup-paragraph">
                <span class="para-number">1</span>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p class="mockup-paragraph">
                <span class="para-number">2</span>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p class="mockup-paragraph">
                <span class="para-number">3</span>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            </div>
            
            <!-- Mockup Footer -->
            <div class="mockup-footer">
              <span>Page 1 of 250</span>
              <span>~45 min left</span>
            </div>
          </div>
          <div class="preview-overlay">
            <Icon name="book-open" :size="48" class="preview-icon" />
          </div>
        </div>
      </div>
    </main>

    <!-- Features Section -->
    <section class="features-section">
      <div class="features-container">
        <div class="section-header">
          <h2 class="section-title">Everything You Need for a Perfect Reading Experience</h2>
          <p class="section-subtitle">Powerful features designed with readers in mind</p>
        </div>

        <div class="features-grid">
          <div class="feature-card glass-white hover-lift">
            <div class="feature-icon-wrapper">
              <div class="feature-icon-bg"></div>
              <Icon name="book-open" :size="32" class="feature-icon" />
            </div>
            <h3 class="feature-title">EPUB Support</h3>
            <p class="feature-description">
              Import and read any EPUB file with full formatting, images, and styling preserved
            </p>
          </div>

          <div class="feature-card glass-white hover-lift">
            <div class="feature-icon-wrapper">
              <div class="feature-icon-bg"></div>
              <Icon name="hash" :size="32" class="feature-icon" />
            </div>
            <h3 class="feature-title">Smart Navigation</h3>
            <p class="feature-description">
              Paragraph numbering and table of contents for easy reference and navigation
            </p>
          </div>

          <div class="feature-card glass-white hover-lift">
            <div class="feature-icon-wrapper">
              <div class="feature-icon-bg"></div>
              <Icon name="edit" :size="32" class="feature-icon" />
            </div>
            <h3 class="feature-title">Interactive Notes</h3>
            <p class="feature-description">
              Highlight text and create notes with automatic chapter and paragraph references
            </p>
          </div>

          <div class="feature-card glass-white hover-lift">
            <div class="feature-icon-wrapper">
              <div class="feature-icon-bg"></div>
              <Icon name="book" :size="32" class="feature-icon" />
            </div>
            <h3 class="feature-title">Personal Library</h3>
            <p class="feature-description">
              Organize all your books in one place with beautiful cover art and metadata
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-container glass">
        <h2 class="cta-title">Ready to Start Reading?</h2>
        <p class="cta-subtitle">Upload your first EPUB and discover a new way to read</p>
        <NuxtLink to="/library?upload=true" class="btn-cta hover-lift">
          Get Started Now
          <Icon name="arrow-right" :size="20" />
        </NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p class="footer-text">
        Made with <span class="heart">❤️</span> using Nuxt.js
      </p>
    </footer>
  </div>
</template>

<script setup>
import Icon from '~/components/ui/Icon.vue'

// Page meta
useHead({
  title: 'Nuxt eReader - Modern EPUB Reader',
  meta: [
    { name: 'description', content: 'A beautiful, modern EPUB reader built with Nuxt.js. Features paragraph numbering, note-taking, and elegant reading experience.' }
  ]
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: var(--primary-gradient);
}

/* Animated Background */
.background-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
}

.gradient-sphere {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  animation: float 20s ease-in-out infinite;
}

.sphere-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #818cf8 0%, transparent 70%);
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.sphere-2 {
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, #a78bfa 0%, transparent 70%);
  bottom: -300px;
  right: -300px;
  animation-delay: 5s;
}

.sphere-3 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #c084fc 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 10s;
}

/* Navigation Header */
.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  padding: 1rem 0;
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: white;
  font-weight: 500;
  transition: all var(--transition-base);
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: white;
  transition: width var(--transition-base);
}

.nav-link:hover::after {
  width: 100%;
}

.nav-cta {
  background: white;
  color: var(--primary-color);
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-cta:hover {
  background: var(--bg-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.nav-cta::after {
  display: none;
}

/* Hero Section */
.hero-section {
  position: relative;
  z-index: 1;
  padding: 8rem 2rem 4rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rem;
}

.hero-content {
  max-width: 800px;
  text-align: center;
  animation: fadeIn 0.8s ease-out;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-full);
  margin-bottom: 2rem;
  font-size: 0.875rem;
  color: white;
  font-weight: 500;
  animation: slideUp 0.8s ease-out 0.2s both;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  animation: slideUp 0.8s ease-out 0.3s both;
}

.hero-description {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  line-height: 1.6;
  animation: slideUp 0.8s ease-out 0.4s both;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 4rem;
  animation: slideUp 0.8s ease-out 0.5s both;
}

.btn-hero-primary,
.btn-hero-secondary {
  padding: 1rem 2rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all var(--transition-base);
}

.btn-hero-primary {
  background: white;
  color: var(--primary-color);
  box-shadow: var(--shadow-lg);
}

.btn-hero-primary:hover {
  background: var(--bg-secondary);
}

.btn-hero-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-hero-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
}

.hero-stats {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: slideUp 0.8s ease-out 0.6s both;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-full);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-icon {
  font-size: 1.25rem;
}

/* Hero Preview */
.hero-preview {
  max-width: 600px;
  animation: scaleIn 0.8s ease-out 0.7s both;
}

.preview-card {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  aspect-ratio: 16 / 10;
  background: var(--bg-secondary);
}

/* Mockup Styles */
.preview-mockup {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 0.75rem;
}

.mockup-header {
  background: var(--bg-tertiary);
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mockup-controls {
  display: flex;
  gap: 0.375rem;
}

.control-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-color);
}

.control-dot:first-child {
  background: #ef4444;
}

.control-dot:nth-child(2) {
  background: #f59e0b;
}

.control-dot:nth-child(3) {
  background: #10b981;
}

.mockup-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.mockup-content {
  flex: 1;
  padding: 1.5rem;
  overflow: hidden;
  background: white;
}

.mockup-paragraph {
  margin: 0 0 1rem 0;
  line-height: 1.6;
  color: var(--text-secondary);
  position: relative;
  padding-left: 2rem;
  font-size: 0.8125rem;
}

.para-number {
  position: absolute;
  left: 0;
  top: 0;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--primary-gradient);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
}

.mockup-footer {
  background: var(--bg-tertiary);
  padding: 0.75rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: var(--primary-gradient);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--transition-base);
}

.preview-card:hover .preview-overlay {
  opacity: 0.9;
}

.preview-icon {
  color: white;
  transform: scale(0);
  transition: transform var(--transition-base);
}

.preview-card:hover .preview-icon {
  transform: scale(1);
}

/* Features Section */
.features-section {
  position: relative;
  z-index: 1;
  padding: 6rem 2rem;
  background: var(--bg-secondary);
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
  animation: fadeIn 0.8s ease-out;
}

.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2.5rem;
  border-radius: var(--radius-xl);
  text-align: center;
  animation: fadeIn 0.8s ease-out;
}

.feature-icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
}

.feature-icon-bg {
  position: absolute;
  inset: 0;
  background: var(--primary-gradient);
  border-radius: var(--radius-lg);
  opacity: 0.1;
  transform: rotate(45deg);
}

.feature-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--primary-color);
}

.feature-title {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  position: relative;
  z-index: 1;
  padding: 6rem 2rem;
  background: var(--primary-gradient);
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 4rem;
  border-radius: var(--radius-2xl);
}

.cta-title {
  font-size: clamp(2rem, 4vw, 3rem);
  color: white;
  margin-bottom: 1rem;
}

.cta-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2.5rem;
  background: white;
  color: var(--primary-color);
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 1.125rem;
  box-shadow: var(--shadow-lg);
}

.btn-cta:hover {
  background: var(--bg-secondary);
}

/* Footer */
.footer {
  position: relative;
  z-index: 1;
  padding: 3rem 2rem;
  text-align: center;
  background: var(--bg-secondary);
}

.footer-text {
  color: var(--text-secondary);
}

.heart {
  color: #ef4444;
  display: inline-block;
  animation: pulse 2s ease-in-out infinite;
}

/* Icon Addition */
.nav-links svg,
.hero-actions svg,
.btn-cta svg {
  transition: transform var(--transition-base);
}

.nav-cta:hover svg,
.btn-hero-primary:hover svg,
.btn-hero-secondary:hover svg,
.btn-cta:hover svg {
  transform: translateX(2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .hero-section {
    padding: 6rem 1rem 3rem;
    min-height: auto;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 0 auto 3rem;
  }

  .btn-hero-primary,
  .btn-hero-secondary {
    width: 100%;
    justify-content: center;
  }

  .hero-stats {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .stat-item {
    width: 100%;
    justify-content: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-container {
    padding: 2rem;
  }
}

@media (max-width: 480px) {
  .logo-text {
    display: none;
  }

  .nav-link:not(.nav-cta) {
    display: none;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }
}
</style>