# Changelog

All notable changes to `@m3ui-vue/nuxt` are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [0.2.0] - Unreleased

### Added
- `cookies` (default `true`): the theme, the palette and the contrast level are kept in cookies too and passed to the library as `initialState`, so the server renders with the user's choice. `useM3Theme()` and `useM3ColorPalette()` report it during server rendering and hydration, and UI built from them (a theme toggle's icon, a selected palette swatch) needs no `<ClientOnly>`. **Before, they reported the defaults on the server; now, without cookies yet, they report the configured defaults (`palette`, `contrast`) instead of the baseline.** Needs `@m3ui-vue/m3ui-vue` 1.0.3

## [0.1.1] - 2026-10-19

### Changed
- The README says to keep `vue` in the app's own dependencies. No changes to the module itself; the first release published from CI through npm's trusted publishing

## [0.1.0] - 2026-10-19

### Added
- First release: installs `createM3UI()` with the module's options (`m3ui` in `nuxt.config`; `locale` takes a preset's code), auto-imports the components (the optional-entry ones only when their dependency is installed) and the composables with an `M3` prefix (`useM3Theme`…), adds `@m3ui-vue/m3ui-vue/styles`, and inlines `themeInitScript()` in `<head>` so the user's dark mode, palette and contrast are on the server-rendered page before the first paint. Needs `@m3ui-vue/m3ui-vue` 1.0.2 or later
