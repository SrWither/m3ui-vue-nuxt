# @m3ui-vue/nuxt

<p>
  <a href="https://www.npmjs.com/package/@m3ui-vue/nuxt"><img src="https://img.shields.io/npm/v/@m3ui-vue/nuxt?color=blue" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@m3ui-vue/nuxt"><img src="https://img.shields.io/npm/l/@m3ui-vue/nuxt" alt="license"></a>
</p>

Nuxt module for [m3ui-vue](https://m3ui.dev), the Material Design 3 component library for Vue 3 + Tailwind CSS v4.

It installs the library's plugin, auto-imports its components and composables, adds its stylesheet, and puts the
user's theme (dark mode, palette, contrast) on the server-rendered page before the first paint.

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
`MRichTextEditor`, `MTerminal`, `MQRCode` and `MBarcode` are registered when their optional dependency is installed
(see the library's README).

The composables are prefixed so they can't clash with other modules (`useDevice`, `useTheme`… are common names):

| Library | Auto-imported as |
|---|---|
| `useTheme` | `useM3Theme` |
| `useColorPalette` | `useM3ColorPalette` |
| `useToast` | `useM3Toast` |
| `useNotification` | `useM3Notification` |
| `useLocale` | `useM3Locale` |
| `useDevice` | `useM3Device` |
| `useWindowSizeClass` | `useM3WindowSizeClass` |
| `useFieldBg`, `useDebounce`, `usePageProgress`, `useSpring` | `useM3FieldBg`, `useM3Debounce`, `useM3PageProgress`, `useM3Spring` |

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
`localStorage` wasn't, the first render shows the defaults and switches to the stored choice once hydrated.

The adaptive layouts (`MNavigationSuite`, `MListDetail`, `MSupportingPane`) measure their own size, which the server
doesn't know: they render their compact layout there and adapt on the client.

A `seed` default can't be generated before the app loads: on the first visit the page shows the baseline palette
until it does (later visits use the cached scheme).

## Development

```bash
pnpm install
pnpm dev:prepare   # stub the module and generate types
pnpm dev           # the playground, with the library linked from ../m3ui-vue
pnpm test          # builds a fixture app and checks its server-rendered HTML
pnpm test:types
```

`dev:prepare` stubs the module (it loads `src/module.ts` on the fly), and with the stub the editor types the `m3ui`
options in the playground's `nuxt.config.ts` loosely (no autocompletion of palette ids, for instance). `pnpm build`
followed by `nuxi prepare playground` types them like the published package.

## License

MIT
