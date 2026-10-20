import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { addComponent, addImports, addPlugin, addTemplate, addTypeTemplate, createResolver, defineNuxtModule, hasNuxtModule, resolvePath, tryResolveModule, useLogger } from '@nuxt/kit'
import type { M3Locale, M3UIOptions } from '@m3ui-vue/m3ui-vue'

const LIB = '@m3ui-vue/m3ui-vue'

/** The presets shipped in `@m3ui-vue/m3ui-vue/locales`, by language code. English is the built-in default. */
const LOCALE_PRESETS = { es: 'esLocale', fr: 'frLocale', pt: 'ptLocale', de: 'deLocale', ja: 'jaLocale', zh: 'zhLocale', ko: 'koLocale' } as const
export type LocalePreset = keyof typeof LOCALE_PRESETS | 'en'

/** Components living in their own entry point, registered only when their optional peer dependency is installed. */
const OPTIONAL_ENTRIES: Record<string, string> = {
  [`${LIB}/chart`]: 'chart.js',
  [`${LIB}/code-editor`]: 'codemirror',
  [`${LIB}/markdown`]: 'markdown-it',
  [`${LIB}/rich-text-editor`]: '@tiptap/vue-3',
  [`${LIB}/terminal`]: '@xterm/xterm',
  [`${LIB}/qrcode`]: 'qrcode-generator',
  [`${LIB}/barcode`]: 'jsbarcode',
}

export interface ModuleOptions extends Omit<M3UIOptions, 'locale'> {
  /**
   * Built-in text: a preset's language code (`'es'`, `'fr'`, `'pt'`, `'de'`, `'ja'`, `'zh'`, `'ko'`; `'en'` is the
   * default), your own strings, which override English, or `'auto'` to follow `@nuxtjs/i18n`'s current language
   * (by its language tag, `es-AR` → `es`; English where there's no preset), switching with it.
   */
  locale?: LocalePreset | 'auto' | Partial<M3Locale>
  /** Auto-import the components (`<MButton>`…). Each one is bundled only where it's used. Default `true`. */
  components?: boolean
  /**
   * Auto-import the composables, prefixed so they can't clash with other modules: `useTheme` becomes `useM3Theme`,
   * `useColorPalette` `useM3ColorPalette`… Set the `prefix`, or `false` to import them yourself from
   * `@m3ui-vue/m3ui-vue`. Default `{ prefix: 'M3' }`.
   */
  composables?: boolean | { prefix?: string }
  /** Add the components' own stylesheet (`@m3ui-vue/m3ui-vue/styles`). Default `true`. */
  css?: boolean
  /**
   * Remember the theme, the palette and the contrast level in cookies too, so the server renders with the user's
   * choice: `useM3Theme()` and `useM3ColorPalette()` report it during server rendering and hydration, and UI built
   * from them needs no `<ClientOnly>`. The window's size goes in one too, so the adaptive layouts (`MNavigationSuite`,
   * `MListDetail`, `MSupportingPane`) render for the user's screen instead of compact. Default `true`.
   */
  cookies?: boolean
  /**
   * Inline `themeInitScript()` in `<head>`, so dark mode, the palette and the contrast level the user picked are
   * on the server-rendered page before the first paint. Default `true`.
   */
  themeScript?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@m3ui-vue/nuxt',
    configKey: 'm3ui',
    compatibility: { nuxt: '>=3.0.0' },
  },
  defaults: {
    components: true,
    composables: { prefix: 'M3' },
    css: true,
    cookies: true,
    themeScript: true,
  },
  async setup(options, nuxt) {
    const logger = useLogger('@m3ui-vue/nuxt')
    const resolver = createResolver(import.meta.url)
    const { components, composables, css, cookies, themeScript, locale, ...plugin } = options

    // The library's own API index (dist/api.json) lists every component and composable with its entry point
    const entry = await resolvePath(LIB, { extensions: ['.js', '.mjs'] })
    let api: { components: { name: string, import: string }[], values: { name: string, import: string }[] }
    try {
      api = JSON.parse(readFileSync(join(dirname(entry), 'api.json'), 'utf8'))
    }
    catch {
      logger.error(`Couldn't read ${LIB}'s dist/api.json: is ${LIB} installed?`)
      return
    }

    if (components) {
      for (const component of api.components) {
        const peer = OPTIONAL_ENTRIES[component.import]
        if (peer && !(await tryResolveModule(peer, nuxt.options.modulesDir))) continue
        addComponent({ name: component.name, export: component.name, filePath: component.import })
      }
    }

    if (composables) {
      const prefix = typeof composables === 'object' ? composables.prefix ?? '' : 'M3'
      addImports(api.values
        .filter(value => /^use[A-Z]/.test(value.name))
        .map(value => ({ name: value.name, as: `use${prefix}${value.name.slice(3)}`, from: value.import })))
    }

    if (css) nuxt.options.css.push(`${LIB}/styles`)

    // The plugin's options, with the locale preset imported by name so only that one is bundled ('auto' needs them all)
    const auto = locale === 'auto'
    const preset = typeof locale === 'string' && locale !== 'en' && !auto ? LOCALE_PRESETS[locale] : undefined
    if (typeof locale === 'string' && locale !== 'en' && !auto && !preset) logger.warn(`Unknown locale preset '${locale}', using English`)
    if (auto) {
      nuxt.hook('modules:done', () => {
        if (!hasNuxtModule('@nuxtjs/i18n')) logger.warn(`locale: 'auto' follows @nuxtjs/i18n, which isn't installed: using English`)
      })
    }
    addTemplate({
      filename: 'm3ui.options.mjs',
      getContents: () => [
        preset ? `import { ${preset} } from '${LIB}/locales'` : '',
        auto ? `import * as presets from '${LIB}/locales'` : '',
        `export const options = ${JSON.stringify(plugin)}`,
        `export const locale = ${preset ?? (typeof locale === 'object' ? JSON.stringify(locale) : 'undefined')}`,
        `export const autoLocale = ${auto}`,
        `export const localePresets = ${auto ? `{ ${Object.entries(LOCALE_PRESETS).map(([code, name]) => `${code}: presets.${name}`).join(', ')} }` : '{}'}`,
        `export const cookies = ${JSON.stringify(cookies)}`,
        `export const themeScript = ${JSON.stringify(themeScript)}`,
      ].join('\n'),
    })
    addTypeTemplate({
      filename: 'types/m3ui.options.d.ts',
      getContents: () => [
        `declare module '#build/m3ui.options.mjs' {`,
        `  export const options: import('${LIB}').M3UIOptions`,
        `  export const locale: Partial<import('${LIB}').M3Locale> | undefined`,
        `  export const autoLocale: boolean`,
        `  export const localePresets: Record<string, Partial<import('${LIB}').M3Locale>>`,
        `  export const cookies: boolean`,
        `  export const themeScript: boolean`,
        `}`,
      ].join('\n'),
    })

    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
