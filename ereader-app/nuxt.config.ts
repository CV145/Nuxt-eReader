// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  ssr: false, // Single Page Application mode for client-side only
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    buildAssetsDir: 'assets'
  },
  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: ['/', '/404.html']
    }
  },
  vite: {
    define: {
      global: 'globalThis'
    },
    optimizeDeps: {
      include: ['jszip', 'xml2js']
    }
  },
  runtimeConfig: {
    public: {
      deepseekApiKey: process.env.NUXT_PUBLIC_DEEPSEEK_API_KEY || '',
      deepseekApiUrl: process.env.NUXT_PUBLIC_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1'
    }
  }
})
