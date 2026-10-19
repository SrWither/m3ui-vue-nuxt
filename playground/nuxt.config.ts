import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@m3ui-vue/nuxt'],
  css: ['~/assets/main.css'],
  vite: { plugins: [tailwindcss()] },
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block' },
      ],
    },
  },
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  m3ui: {
    palette: 'teal',
  },
})
