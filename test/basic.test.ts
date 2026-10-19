import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

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

  it('applies the locale preset', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('Página siguiente')
  })

  it('auto-imports the prefixed composables', async () => {
    const html = await $fetch<string>('/')
    // The server doesn't know the user's choice: the defaults until the client applies it
    expect(html).toContain('<p id="theme">system</p>')
    expect(html).toContain('<p id="palette">purple</p>')
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
})
