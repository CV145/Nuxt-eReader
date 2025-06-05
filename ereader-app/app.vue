<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style>
/* Global styles */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

#__nuxt {
  height: 100vh;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Focus styles */
button:focus,
input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Context Menu Styles (Global) */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 4px;
  z-index: 10000;
  min-width: 180px;
}

.context-menu .menu-item {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #333;
}

.context-menu .menu-item:hover {
  background: #f3f4f6;
  color: #3b82f6;
}

.context-menu .menu-item svg {
  flex-shrink: 0;
}
</style> 