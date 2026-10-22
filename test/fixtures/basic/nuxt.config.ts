import M3UI from '../../../src/module'

export default defineNuxtConfig({
  modules: [M3UI],
  m3ui: {
    palette: 'red',
    locale: 'es',
    viewportHints: true,
  },
})
