import { createM3UI, themeInitScript } from '@m3ui-vue/m3ui-vue'
import { defineNuxtPlugin, useHead } from '#app'
import { locale, options, themeScript } from '#build/m3ui.options.mjs'

export default defineNuxtPlugin({
  name: 'm3ui',
  enforce: 'pre',
  setup(nuxtApp) {
    // isHydrating: the adaptive layouts render their first client frame like the server did, then adapt
    nuxtApp.vueApp.use(createM3UI({ ...options, locale, isHydrating: () => !!nuxtApp.isHydrating }))

    // Before the first paint: the server-rendered page otherwise shows light mode and the default palette until the
    // app's JS applies the user's choice
    if (import.meta.server && themeScript) {
      useHead({
        script: [{
          key: 'm3ui-theme',
          innerHTML: themeInitScript({ palette: options.palette, contrast: options.contrast, persistPalette: options.persistPalette }),
          tagPriority: 'critical',
        }],
      })
    }
  },
})
