export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  compatibilityDate: '2024-11-27',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {}
    }
  }
})
