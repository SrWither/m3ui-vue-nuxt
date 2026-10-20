import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@m3ui-vue/nuxt', '@nuxtjs/i18n'],
  css: ['~/assets/main.css'],
  vite: { plugins: [tailwindcss()] },
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block' },
      ],
    },
  },
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  // The app's own text stays in English here: i18n only drives the components' built-in text (locale: 'auto')
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', name: 'English' },
      { code: 'es', language: 'es-ES', name: 'Español' },
      { code: 'fr', language: 'fr-FR', name: 'Français' },
      { code: 'de', language: 'de-DE', name: 'Deutsch' },
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
  },
  m3ui: {
    palette: 'teal',
    locale: 'auto',
  },
})
