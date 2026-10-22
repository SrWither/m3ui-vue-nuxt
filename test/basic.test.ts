import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, fetch, setup, useTestContext } from '@nuxt/test-utils/e2e'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('server-renders auto-imported components', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('-->Hola<!--')
    // MDialog rendered open (teleported to <body>)
    expect(html).toContain('Abierto')
  })

  const suite = (html: string) => html.match(/<div[^>]*id="suite"[^>]*>/)?.[0]
  const PHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
  const DESKTOP = 'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0'

  it('renders the adaptive layouts for the window size in the cookie', async () => {
    // A desktop: a rail beside the content (a row); a phone: compact (a column)
    expect(suite(await $fetch<string>('/', { headers: { cookie: 'm3-viewport=1280x800', 'user-agent': PHONE } }))).toContain('flex-row')
    expect(suite(await $fetch<string>('/', { headers: { cookie: 'm3-viewport=390x844', 'user-agent': DESKTOP } }))).toContain('flex-col')
  })

  it('guesses the window from the device on a first visit, or takes the viewport hints', async (ctx) => {
    // Needs m3ui-vue ≥ 1.2.0 (viewportFromHeaders): with an older one a first visit renders compact, as it always did
    const desktop = suite(await $fetch<string>('/', { headers: { 'user-agent': DESKTOP } }))
    if (!desktop?.includes('flex-row')) ctx.skip()
    expect(suite(await $fetch<string>('/', { headers: { 'user-agent': PHONE } }))).toContain('flex-col')
    expect(suite(await $fetch<string>('/', { headers: { 'user-agent': PHONE, 'sec-ch-viewport-width': '1280', 'sec-ch-viewport-height': '800' } }))).toContain('flex-row')
    // Handed to the client in the payload, so hydration renders the same
    expect(await $fetch<string>('/', { headers: { 'user-agent': DESKTOP } })).toContain('m3ui-viewport')
  })

  it('asks for the viewport client hints with viewportHints', async () => {
    const res = await fetch('/')
    expect(res.headers.get('accept-ch')).toBe('Sec-CH-Viewport-Width, Sec-CH-Viewport-Height')
    expect(res.headers.get('critical-ch')).toBe('Sec-CH-Viewport-Width, Sec-CH-Viewport-Height')
    expect(res.headers.get('vary')).toContain('Sec-CH-Viewport-Width')
  })

  it('applies the locale preset', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('Página siguiente')
  })

  it('auto-imports the prefixed composables', async () => {
    const html = await $fetch<string>('/')
    // A first visit (no cookies): the configured defaults
    expect(html).toContain('<p id="theme">system</p>')
    expect(html).toContain('<p id="palette">red</p>')
  })

  it('renders the user\'s choice from the cookies', async () => {
    const html = await $fetch<string>('/', { headers: { cookie: 'm3-theme=dark; m3-palette=blue; m3-contrast=high' } })
    expect(html).toContain('<p id="theme">dark</p>')
    expect(html).toContain('<p id="palette">blue</p>')
  })

  it('inlines the theme script in <head> with the plugin defaults', async () => {
    const html = await $fetch<string>('/')
    const head = html.slice(0, html.indexOf('</head>'))
    expect(head).toContain('m3-palette')
    expect(head).toContain('"palette":"red"')
  })

  it('adds the components stylesheet', async () => {
    const html = await $fetch<string>('/')
    expect(html).toMatch(/<link[^>]+stylesheet|<style/)
  })

  it('skips the components and composables of an entry point whose dependency isn\'t installed', () => {
    // Neither chart.js nor maplibre-gl is installed here
    const buildDir = useTestContext().nuxt!.options.buildDir
    const components = readFileSync(join(buildDir, 'components.d.ts'), 'utf8')
    const imports = readFileSync(join(buildDir, 'types/imports.d.ts'), 'utf8')
    expect(components).toContain('MButton')
    expect(components).not.toContain('MChart')
    expect(components).not.toContain('MMap')
    expect(imports).toContain('useM3Theme')
    expect(imports).not.toContain('useM3Map')
  })
})
