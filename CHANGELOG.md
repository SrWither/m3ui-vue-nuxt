# Changelog

All notable changes to `@m3ui-vue/nuxt` are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [0.4.0] - Unreleased

### Added
- `storagePrefix`: as in `createM3UI()` (`'shop'` → `shop-m3-theme`, `shop-m3-palette`…), so apps on one domain under different paths keep their own theme, palette and contrast. The server reads the prefixed cookies (theme, palette, contrast, viewport) and the inlined `themeInitScript()` uses the prefixed keys. Needs `@m3ui-vue/m3ui-vue` 1.2.2

## [0.3.0] - 2026-10-22

### Added
- `viewportHints` (default `false`): asks Chromium for the window's exact size with client hints (`Accept-CH` / `Critical-CH: Sec-CH-Viewport-Width, Sec-CH-Viewport-Height`, plus `Vary`), so the adaptive layouts render at it on a first visit too, at the cost of that visit's request being repeated once. Needs `cookies`

### Changed
- **A first visit renders the adaptive layouts (`MNavigationSuite`, `MListDetail`, `MSupportingPane`) for the kind of device instead of compact**, with `@m3ui-vue/m3ui-vue` 1.2.0 or later (its `viewportFromHeaders`: phone, tablet or desktop from `Sec-CH-UA-Mobile` and the user agent): a desktop gets its rail from the first paint. The size is worked out on the server and handed to the client in the payload, so hydration matches. With an older library, as before

## [0.2.4] - 2026-10-21

### Fixed
- The `MMap` components and the `useM3Map`, `useM3MapLayers` and `useM3MapFilter` composables were registered even without `maplibre-gl` installed, so using one failed at build time on a missing import instead of being unknown. They're now registered only with it, like the other optional entry points; the README lists them, and `useM3Confetti`

## [0.2.0] - 2026-10-19

### Added
- `cookies` (default `true`): the theme, the palette and the contrast level are kept in cookies too and passed to the library as `initialState`, so the server renders with the user's choice. `useM3Theme()` and `useM3ColorPalette()` report it during server rendering and hydration, and UI built from them (a theme toggle's icon, a selected palette swatch) needs no `<ClientOnly>`. **Before, they reported the defaults on the server; now, without cookies yet, they report the configured defaults (`palette`, `contrast`) instead of the baseline.** Needs `@m3ui-vue/m3ui-vue` 1.0.3
- The `palette` option autocompletes the built-in palette ids (the library's `PaletteId`, 1.0.3)
- `locale: 'auto'`: the components' built-in text follows `@nuxtjs/i18n`'s current language, on the server and when it switches. A language tag picks its language's preset (`es-AR` → Spanish), English otherwise. All seven presets are bundled with it (about 11 kB gzipped)
- With `cookies`, the window's size is kept in a cookie too (`m3-viewport`) and passed to the library, so from a user's second visit on the adaptive layouts (`MNavigationSuite`, `MListDetail`, `MSupportingPane`) render for their screen on the server: a desktop gets its rail from the first paint instead of compact then rail

### Changed
- The README marks server-side rendering and this module as beta, with where to report problems
- A browser test hydrates a fixture app in Chromium (overlays open on load, cookies of a returning user, a phone) and fails on any hydration warning. It found two bugs fixed in `@m3ui-vue/m3ui-vue` 1.0.3: an `MLightbox` open on load, and a choice kept only in a cookie being reset

## [0.1.1] - 2026-10-19

### Changed
- The README says to keep `vue` in the app's own dependencies. No changes to the module itself; the first release published from CI through npm's trusted publishing

## [0.1.0] - 2026-10-19

### Added
- First release: installs `createM3UI()` with the module's options (`m3ui` in `nuxt.config`; `locale` takes a preset's code), auto-imports the components (the optional-entry ones only when their dependency is installed) and the composables with an `M3` prefix (`useM3Theme`…), adds `@m3ui-vue/m3ui-vue/styles`, and inlines `themeInitScript()` in `<head>` so the user's dark mode, palette and contrast are on the server-rendered page before the first paint. Needs `@m3ui-vue/m3ui-vue` 1.0.2 or later
