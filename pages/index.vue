<script setup lang="ts">
const auth = useAuthStore();

if (!auth.token || !auth.role) {
  navigateTo("/login");
} else {
  switch (auth.role) {
    case "ADMIN":
      navigateTo("/admin/dashboard");
      break;
    case "REGISTRAR":
      navigateTo("/registrar/dashboard");
      break;
    case "STUDENT":
      navigateTo("/student/dashboard");
      break;
  }
}
</script>

<template>
  <div>Redirecting to your dashboard...</div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  max-width: 800px;
  padding: 2rem;
  text-align: center;
}
</style>
