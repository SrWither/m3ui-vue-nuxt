import M3UI from '../../../src/module'

export default defineNuxtConfig({
  modules: [M3UI, '@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'en', language: 'en-US' },
      { code: 'fr', language: 'fr-FR' },
      // A region's language tag resolves to its language's preset
      { code: 'es', language: 'es-AR' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
  },
  m3ui: {
    locale: 'auto',
  },
})
