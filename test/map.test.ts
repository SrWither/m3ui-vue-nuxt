import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createPage, setup, url } from '@nuxt/test-utils/e2e'

const executablePath = [process.env.CHROMIUM_PATH, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']
  .find(path => path && existsSync(path))

// maplibre-gl 6 runs its worker from a file of its own: the module emits it and hands its URL to MMap
describe.skipIf(!executablePath)('MMap with maplibre-gl 6', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/map', import.meta.url)),
    browser: true,
    browserOptions: { type: 'chromium', launch: { executablePath, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } },
  })

  it('loads MapLibre\'s worker and renders the GeoJSON it parses', async () => {
    const page = await createPage()
    const errors: string[] = []
    page.on('console', message => message.type() === 'error' && errors.push(message.text()))
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(url('/'))
    await page.waitForSelector('#map[data-tiles="true"]', { timeout: 20000 })
    expect(errors.filter(text => /worker/i.test(text))).toEqual([])
    await page.close()
  })
})
