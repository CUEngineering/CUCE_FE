// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/scss/main.scss"],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "@/assets/scss/_variables.scss" as *; @use "@/assets/scss/_mixins.scss" as *;',
        },
      },
    },
  },
  runtimeConfig: {
    // Private keys (server-side)
    // publicApiBase: '', // Fallback value

    // Public keys (exposed to client)
    public: {
      apiBaseUrl:
        process.env.API_BASE_URL || "https://cuce-api.charisma.edu.eu",
    },
  },
  // Add global middleware to protect all routes
  // routeRules: {
  //   // Apply auth middleware to all routes except login
  //   "/**": { middleware: ["auth"] },
  // },
  app: {
    head: {
      title: "CUCE",
      link: [{ rel: "icon", type: "image/x-icon", href: "favicon.ico" }],
    },
  },

  modules: ["@pinia/nuxt"],
});
