<template>
  <NuxtLayout>
    <NuxtPage />
    <ToastContainer />
  </NuxtLayout>
</template>

<style lang="scss">
// @use "@/assets/scss/main.scss" as *;

// Google Fonts imports
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap");
</style>

<script setup>
import ToastContainer from "./components/ui/ToastContainer.vue";

// The middleware is configured on individual pages or in nuxt.config.ts
</script>
