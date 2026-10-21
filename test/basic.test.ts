import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup, useTestContext } from '@nuxt/test-utils/e2e'

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

  it('renders the adaptive layouts for the window size in the cookie', async () => {
    // A desktop: a rail beside the content (a row); no cookie: compact (a column)
    const suite = (html: string) => html.match(/<div[^>]*id="suite"[^>]*>/)?.[0]
    expect(suite(await $fetch<string>('/', { headers: { cookie: 'm3-viewport=1280x800' } }))).toContain('flex-row')
    expect(suite(await $fetch<string>('/'))).toContain('flex-col')
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
