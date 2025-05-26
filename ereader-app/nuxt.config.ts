// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    define: {
      global: 'globalThis'
    },
    optimizeDeps: {
      include: ['jszip', 'xml2js']
    }
  }
})
