import { createM3UI, themeInitScript, type M3InitialState } from '@m3ui-vue/m3ui-vue'
import { defineNuxtPlugin, useCookie, useHead } from '#app'
import { cookies, locale, options, themeScript } from '#build/m3ui.options.mjs'

export default defineNuxtPlugin({
  name: 'm3ui',
  enforce: 'pre',
  setup(nuxtApp) {
    // The user's choice from the cookies the library writes, read the same on the server and the client, so both
    // render it (and the client switches to what it has stored once hydrated)
    const read = (name: string) => useCookie<string | undefined>(name, { decode: decodeURIComponent, readonly: true }).value
    const initialState = cookies
      ? { theme: read('m3-theme'), palette: read('m3-palette'), contrast: read('m3-contrast') } as M3InitialState
      : undefined

    // isHydrating: the adaptive layouts and the composables render their first client frame like the server did
    nuxtApp.vueApp.use(createM3UI({ ...options, locale, cookies, initialState, isHydrating: () => !!nuxtApp.isHydrating }))

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
