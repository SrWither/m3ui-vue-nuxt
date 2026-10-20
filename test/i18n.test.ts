import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('locale: auto', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/i18n', import.meta.url)),
  })

  it('follows @nuxtjs/i18n\'s language on the server', async () => {
    expect(await $fetch<string>('/')).toContain('Next page')
    expect(await $fetch<string>('/fr')).toContain('Page suivante')
  })

  it('resolves a region\'s language tag to its language (es-AR → es)', async () => {
    expect(await $fetch<string>('/es')).toContain('Página siguiente')
  })
})
