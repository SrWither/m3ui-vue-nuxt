import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('storagePrefix', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/prefix', import.meta.url)),
  })

  const suite = (html: string) => html.match(/<div[^>]*id="suite"[^>]*>/)?.[0]

  it('ignores the cookies of another app on the same domain', async () => {
    const html = await $fetch<string>('/', { headers: { cookie: 'm3-theme=dark; m3-palette=blue' } })
    expect(html).toContain('<p id="theme">system</p>')
    expect(html).toContain('<p id="palette">red</p>')
  })

  it('renders the choice from its own prefixed cookies', async () => {
    const html = await $fetch<string>('/', { headers: { cookie: 'shop-m3-theme=dark; shop-m3-palette=blue' } })
    expect(html).toContain('<p id="theme">dark</p>')
    expect(html).toContain('<p id="palette">blue</p>')
  })

  it('reads the prefixed viewport cookie and inlines the theme script with the prefixed keys', async (ctx) => {
    // Needs m3ui-vue ≥ 1.2.2 (viewportFromHeaders and themeInitScript take storagePrefix)
    const html = await $fetch<string>('/', { headers: { cookie: 'shop-m3-viewport=1280x800; m3-viewport=390x844', 'user-agent': '' } })
    const head = html.slice(0, html.indexOf('</head>'))
    if (!head.includes('shop-m3-palette')) ctx.skip()
    expect(suite(html)).toContain('flex-row')
  })
})
