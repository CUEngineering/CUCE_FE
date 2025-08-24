// https://nuxt.com/docs/api/configuration/nuxt-config

const nodeEnv = String(process.env.NODE_ENV ?? 'local').toLowerCase();

export default defineNuxtConfig({
  modules: ['nuxt-typed-router', '@pinia/nuxt', '@nuxt/eslint'],
  devtools: { enabled: true },
  // Add global middleware to protect all routes
  // routeRules: {
  //   // Apply auth middleware to all routes except login
  //   "/**": { middleware: ["auth"] },
  // },
  app: {
    head: {
      title: 'CUCE',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' },
      ],
    },
  },
  css: ['~/assets/scss/main.scss'],
  runtimeConfig: {
    // Private keys (server-side)
    // publicApiBase: '', // Fallback value

    // Public keys (exposed to client)
    nodeEnv,
    public: {
      nodeEnv,
      apiBaseUrl:
        process.env.API_BASE_URL ||
        process.env.NUXT_PUBLIC_API_BASE_URL ||
        'https://cuce-api.charisma.edu.eu',
    },
  },
  compatibilityDate: '2024-11-01',
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "@/assets/scss/_variables.scss" as *; @use "@/assets/scss/_mixins.scss" as *;',
        },
      },
    },
    optimizeDeps: {
      entries: [
        '@tanstack/vue-table',
        '@vueuse/core',
        'date-fns',
        'axios',
        'lodash-es',
      ],
    },
  },

  eslint: {
    config: {
      stylistic: {
        semi: true,
        indent: 2,
        quotes: 'double',
        jsx: true,
      },
    },
  },
});
