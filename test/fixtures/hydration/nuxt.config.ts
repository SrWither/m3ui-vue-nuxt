import M3UI from '../../../src/module'

export default defineNuxtConfig({
  modules: [M3UI],
  // A production build, as users run it, with Vue's hydration mismatch details still reported
  vite: { define: { __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true' } },
  m3ui: {
    palette: 'teal',
  },
})
