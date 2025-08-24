<template>
  <NuxtLayout :key="layoutKey">
    <NuxtPage />
    <ToastContainer />
  </NuxtLayout>
</template>

<script setup>
import ToastContainer from './components/ui/ToastContainer.vue';

// The middleware is configured on individual pages or in nuxt.config.ts

const authStore = useAuthStore();
const hydrationRandomKey = ref(Date.now());
const layoutKey = computed(
  () =>
    `${hydrationRandomKey.value}-${authStore.role}-${authStore.token}`,
);

onMounted(() => {
  if (import.meta.client) {
    hydrationRandomKey.value = Date.now();
  }
});
</script>

<style lang="scss">
// @use "@/assets/scss/main.scss" as *;

// Google Fonts imports
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
</style>
