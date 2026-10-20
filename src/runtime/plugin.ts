import { computed } from 'vue'
import { createM3UI, themeInitScript, type M3InitialState } from '@m3ui-vue/m3ui-vue'
import { defineNuxtPlugin, useCookie, useHead } from '#app'
import { autoLocale, cookies, locale, localePresets, options, themeScript } from '#build/m3ui.options.mjs'

interface I18n {
  locale: { value: string }
  localeProperties?: { value: { language?: string } }
}

export default defineNuxtPlugin({
  name: 'm3ui',
  enforce: 'pre',
  setup(nuxtApp) {
    // The user's choice from the cookies the library writes, read the same on the server and the client, so both
    // render it (and the client switches to what it has stored once hydrated)
    const read = (name: string) => useCookie<string | undefined>(name, { decode: decodeURIComponent, readonly: true }).value
    // The window's size (`1280x800`): the adaptive layouts render for it instead of compact
    const [width, height] = (read('m3-viewport') ?? '').split('x').map(Number)
    const initialState = cookies
      ? {
          theme: read('m3-theme'),
          palette: read('m3-palette'),
          contrast: read('m3-contrast'),
          viewport: width && height ? { width, height } : undefined,
        } as M3InitialState
      : undefined

    // locale: 'auto' follows @nuxtjs/i18n's current language. Read lazily, on the first render: its plugin runs after
    // this one
    const appLocale = autoLocale
      ? computed(() => {
          const i18n = (nuxtApp as { $i18n?: I18n }).$i18n
          const tag = i18n?.localeProperties?.value.language || i18n?.locale.value || ''
          return localePresets[tag.toLowerCase().split('-')[0]!] ?? {}
        })
      : locale

    // isHydrating: the adaptive layouts and the composables render their first client frame like the server did
    nuxtApp.vueApp.use(createM3UI({ ...options, locale: appLocale, cookies, initialState, isHydrating: () => !!nuxtApp.isHydrating }))

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
