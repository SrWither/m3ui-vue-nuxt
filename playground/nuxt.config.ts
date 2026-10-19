import { dirname } from 'node:path'
import { createRequire } from 'node:module'
import tailwindcss from '@tailwindcss/vite'

// One Vue for the app and the library. Installed from npm that's already the case; linked from ../m3ui-vue (to try
// unreleased changes) the library would load that repo's own copy, and server rendering breaks with two
const vue = dirname(createRequire(import.meta.url).resolve('vue/package.json'))

export default defineNuxtConfig({
  modules: ['@m3ui-vue/nuxt'],
  alias: { vue },
  nitro: { alias: { vue } },
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
  m3ui: {
    palette: 'teal',
  },
})
