# @m3ui-vue/nuxt

<p>
  <a href="https://www.npmjs.com/package/@m3ui-vue/nuxt"><img src="https://img.shields.io/npm/v/@m3ui-vue/nuxt?color=blue" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@m3ui-vue/nuxt"><img src="https://img.shields.io/npm/l/@m3ui-vue/nuxt" alt="license"></a>
</p>

Nuxt module for [m3ui-vue](https://m3ui.dev), the Material Design 3 component library for Vue 3 + Tailwind CSS v4.

It installs the library's plugin, auto-imports its components and composables, adds its stylesheet, and puts the
user's theme (dark mode, palette, contrast) on the server-rendered page before the first paint.

> **Beta.** Server-side rendering and this module are new. Every component renders on the server and is tested
> there, but real apps will find cases we haven't: if something breaks, renders differently on the server, or Vue
> warns about a hydration mismatch, please [open an issue](https://github.com/SrWither/m3ui-vue-nuxt/issues) (or on
> [m3ui-vue](https://github.com/SrWither/m3ui-vue/issues) for a component).

## Install

```bash
pnpm add @m3ui-vue/nuxt @m3ui-vue/m3ui-vue
pnpm add -D tailwindcss @tailwindcss/vite
```

```ts
// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@m3ui-vue/nuxt'],
  css: ['~/assets/main.css'],
  vite: { plugins: [tailwindcss()] },
  m3ui: {
    palette: 'red',
    locale: 'es',
  },
})
```

Keep `vue` in your app's own dependencies, as Nuxt's starter does: with pnpm, an app that only gets Vue through
`nuxt` can end up loading a second copy on the server, which fails to render.

The theme and the palettes are Tailwind CSS, so they go in your own stylesheet, after Tailwind:

```css
/* assets/main.css */
@import 'tailwindcss';
@import '@m3ui-vue/m3ui-vue/theme';
@import '@m3ui-vue/m3ui-vue/palettes';
```

Load the fonts as the [library's README](https://github.com/SrWither/m3ui-vue#fonts) says (Roboto and Material Symbols),
for example in `app.head.link`.

## Usage

Components work in any page or component without importing them:

```vue
<template>
  <MButton @click="toast.success('Saved')">Save</MButton>
</template>

<script setup lang="ts">
const toast = useM3Toast()
</script>
```

Each component is bundled only where it's used. `MChart`, `MCodeEditor`, `MJsonEditor`, `MMarkdown`,
`MRichTextEditor`, `MTerminal`, `MQRCode`, `MBarcode` and the `MMap` family are registered when their optional
dependency is installed (see the library's README); so are `useMap`, `useMapLayers` and `useMapFilter`.

The composables are prefixed so they can't clash with other modules (`useDevice`, `useTheme`… are common names):

| Library | Auto-imported as |
|---|---|
| `useTheme` | `useM3Theme` |
| `useThemeTokens` | `useM3ThemeTokens` |
| `useColorPalette` | `useM3ColorPalette` |
| `useToast` | `useM3Toast` |
| `useNotification` | `useM3Notification` |
| `useLocale` | `useM3Locale` |
| `useDevice` | `useM3Device` |
| `useWindowSizeClass` | `useM3WindowSizeClass` |
| `useConfetti` | `useM3Confetti` |
| `useContainerTransform` | `useM3ContainerTransform` |
| `useFieldBg`, `useDebounce`, `useAutoGrow`, `usePageProgress`, `useSpring`, `useScrollReveal` | `useM3FieldBg`, `useM3Debounce`, `useM3AutoGrow`, `useM3PageProgress`, `useM3Spring`, `useM3ScrollReveal` |
| `useMap`, `useMapLayers`, `useMapFilter` (with `maplibre-gl`) | `useM3Map`, `useM3MapLayers`, `useM3MapFilter` |

Anything else (types, `palettes`, `motionSprings`…) is imported from `@m3ui-vue/m3ui-vue` as usual.

## Options

Everything `createM3UI()` takes, plus what the module itself does:

| Option | Default | |
|---|---|---|
| `palette`, `seed`, `seedOptions`, `contrast`, `persistPalette`, `customPalettes`, `themeColor` | | As in `createM3UI()` |
| `locale` | English | A preset's code (`'es'`, `'fr'`, `'pt'`, `'de'`, `'ja'`, `'zh'`, `'ko'`), your own strings, or `'auto'` to follow `@nuxtjs/i18n` |
| `components` | `true` | Auto-import the components |
| `composables` | `{ prefix: 'M3' }` | Auto-import the composables with this prefix; `false` to import them yourself |
| `css` | `true` | Add `@m3ui-vue/m3ui-vue/styles` |
| `cookies` | `true` | Keep the theme, palette and contrast in cookies too, so the server renders with them |
| `themeScript` | `true` | Inline `themeInitScript()` in `<head>` |

## With @nuxtjs/i18n

`locale: 'auto'` makes the components' built-in text (pagination, pickers, dialogs…) follow `@nuxtjs/i18n`'s current
language, on the server and when the user switches it. A language tag picks its language's preset (`es-AR` → Spanish);
languages without one fall back to English.

```ts
export default defineNuxtConfig({
  modules: ['@m3ui-vue/nuxt', '@nuxtjs/i18n'],
  i18n: {
    locales: [{ code: 'en', language: 'en-US' }, { code: 'es', language: 'es-AR' }],
    defaultLocale: 'en',
  },
  m3ui: { locale: 'auto' },
})
```

With `'auto'` all seven presets are bundled (about 11 kB gzipped), since the language can change at any time.

## Server-side rendering

The library keeps the user's theme, palette and contrast in `localStorage`, and with `cookies` (on by default) in
cookies too, which the server reads. So `useM3Theme()` and `useM3ColorPalette()` report the user's choice while the
page renders on the server, and anything built from them (a theme toggle's icon, the selected palette swatch) hydrates
without mismatches, no `<ClientOnly>` needed:

```vue
<template>
  <MIconButton :icon="theme === 'dark' ? 'dark_mode' : 'light_mode'" label="Theme" @click="cycle" />
</template>

<script setup lang="ts">
const { theme, cycle } = useM3Theme()
</script>
```

The inlined script puts dark mode, the palette and the contrast on `<html>` before the page paints. What the server
can't know is the system's preferences: with the `'system'` theme or contrast, `theme` is `'system'` there (whether
the page ends up dark is decided in the browser), and `activeContrast` is `'standard'`. If cookies were cleared but
`localStorage` wasn't, the first render shows the defaults and switches to the stored choice once hydrated. The other way
around, a choice only in the cookies is used too: your server can set `m3-theme`, `m3-palette` or `m3-contrast` to apply
a theme saved in the user's account, for instance.

The adaptive layouts (`MNavigationSuite`, `MListDetail`, `MSupportingPane`) measure their own size, which the server
can't. With `cookies`, the window's size is kept in a cookie too (`m3-viewport`), so from the second visit on they
render on the server for the user's screen (one in a narrower column corrects itself on the client). On a first visit
they render their compact layout and adapt once the page is interactive.

A `seed` default can't be generated before the app loads: on the first visit the page shows the baseline palette
until it does (later visits use the cached scheme).

## Development

```bash
pnpm install
pnpm dev:prepare   # stub the module and generate types
pnpm dev           # the playground, with the library linked from ../m3ui-vue
pnpm test          # builds fixture apps, checks their server-rendered HTML and hydrates one in Chromium
pnpm test:types
```

The hydration test (`test/browser.test.ts`) drives the Chromium already on the machine through `playwright-core` (no
browser download): `/usr/bin/chromium` and the usual paths, or `CHROMIUM_PATH`. It fails on any hydration warning
or page error, including overlays open on load; without a Chromium it's skipped.

`dev:prepare` stubs the module (it loads `src/module.ts` on the fly), and with the stub the editor types the `m3ui`
options in the playground's `nuxt.config.ts` loosely (no autocompletion of palette ids, for instance). `pnpm build`
followed by `nuxi prepare playground` types them like the published package.

## License

MIT
