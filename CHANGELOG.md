# Changelog

All notable changes to `@m3ui-vue/nuxt` are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [0.1.0] - 2026-10-19

### Added
- First release: installs `createM3UI()` with the module's options (`m3ui` in `nuxt.config`; `locale` takes a preset's code), auto-imports the components (the optional-entry ones only when their dependency is installed) and the composables with an `M3` prefix (`useM3Theme`…), adds `@m3ui-vue/m3ui-vue/styles`, and inlines `themeInitScript()` in `<head>` so the user's dark mode, palette and contrast are on the server-rendered page before the first paint. Needs `@m3ui-vue/m3ui-vue` 1.0.2 or later
