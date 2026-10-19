import { dirname } from 'node:path'
import { createRequire } from 'node:module'
import M3UI from '../../../src/module'

// One Vue for the app and the library. Installed from npm that's already the case; linked from ../m3ui-vue (to try
// unreleased changes) the library would load that repo's own copy, and server rendering breaks with two
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
