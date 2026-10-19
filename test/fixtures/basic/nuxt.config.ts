import { dirname } from 'node:path'
import { createRequire } from 'node:module'
import M3UI from '../../../src/module'

// The library is linked from ../m3ui-vue, which has its own Vue: point it at the app's one, as an installed package
// (with Vue as a peer) resolves it
const vue = dirname(createRequire(import.meta.url).resolve('vue/package.json'))

export default defineNuxtConfig({
  modules: [M3UI],
  alias: { vue },
  nitro: { alias: { vue } },
  m3ui: {
    palette: 'red',
    locale: 'es',
  },
})
