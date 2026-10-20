import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createPage, setup, url, waitForHydration } from '@nuxt/test-utils/e2e'

// A Chromium already on the machine (no browser download); the suite is skipped without one
const executablePath = [process.env.CHROMIUM_PATH, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']
  .find(path => path && existsSync(path))

describe.skipIf(!executablePath)('hydration in a real browser', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/hydration', import.meta.url)),
    browser: true,
    browserOptions: { type: 'chromium', launch: { executablePath } },
  })

  /** Loads the page with these cookies and returns what the browser reported while hydrating it. */
  async function load(cookies: Record<string, string>, viewport = { width: 1280, height: 800 }) {
    const page = await createPage(undefined, { viewport })
    const problems: string[] = []
    page.on('console', async (message) => {
      if (!/hydration|mismatch/i.test(message.text())) return
      problems.push(message.text().split('\n')[0]!)
      // M3_DEBUG=1: the mismatching node and its parents, to find the component
      if (process.env.M3_DEBUG) {
        for (const arg of message.args()) {
          problems.push(await arg.evaluate((n: unknown) => {
            if (!(n instanceof Node)) return String(n)
            const el = (n instanceof Element ? n : n.parentElement)
            const path = []
            for (let e = el; e && path.length < 4; e = e.parentElement) path.push(`${e.tagName.toLowerCase()}.${String(e.className).split(' ').slice(0, 4).join('.')}`)
            return `${n.nodeType === 8 ? `<!--${(n as Comment).data}-->` : (n as Element).outerHTML?.slice(0, 160) ?? n.textContent} IN ${path.join(' < ')}`
          }).catch(() => '?'))
        }
      }
    })
    page.on('pageerror', error => problems.push(`pageerror: ${error.message}`))
    const origin = url('/')
    await page.context().addCookies(Object.entries(cookies).map(([name, value]) => ({ name, value, url: origin })))
    await page.goto(origin)
    await waitForHydration(page, origin)
    // Let the post-mount switches (stored values, measured sizes) and their springs run
    await page.waitForTimeout(500)
    return { page, problems }
  }

  it('hydrates a first visit (no cookies) without mismatches', async () => {
    const { page, problems } = await load({})
    expect(problems).toEqual([])
    await page.close()
  })

  it('hydrates a returning user\'s choice (theme, palette, viewport) without mismatches', async () => {
    const { page, problems } = await load({ 'm3-theme': 'dark', 'm3-palette': 'blue', 'm3-viewport': '1280x800' })
    expect(problems).toEqual([])
    // Rendered dark from the server on
    expect(await page.locator('#theme').getAttribute('aria-label')).toBe('Theme')
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true)
    await page.close()
  })

  it('hydrates on a phone-sized screen without mismatches', async () => {
    const { page, problems } = await load({ 'm3-viewport': '390x844' }, { width: 390, height: 844 })
    expect(problems).toEqual([])
    await page.close()
  })
})
