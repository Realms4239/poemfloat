// https://nuxt.com/docs/api/configuration/nuxt-config
import glsl from 'vite-plugin-glsl'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2026-01-05',
  devtools: { enabled: false },
  telemetry: false,
  ssr: false,
  srcDir: 'src',

  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
    '~': fileURLToPath(new URL('./src', import.meta.url))
  },

  modules: [
    '@pinia/nuxt',
    '@tresjs/nuxt'
  ],

  components: [
    {
      path: '~/presentation/components',
      pathPrefix: false,
    },
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  vite: {
    plugins: [glsl()],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/styles/_variables.scss" as *;'
        }
      }
    },
    build: {
      transpile: ['tresjs', 'three', 'gsap']
    }
  },

  app: {
    head: {
      title: 'Une Collection de Poèmes',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/cat-paw.png' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap' }
      ]
    }
  }
})
