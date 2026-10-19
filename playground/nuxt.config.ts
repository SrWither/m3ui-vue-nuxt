import { dirname } from 'node:path'
import { createRequire } from 'node:module'
import tailwindcss from '@tailwindcss/vite'

// The library is linked from ../m3ui-vue, which has its own Vue: point it at the app's one, as an installed package
// (with Vue as a peer) resolves it
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
