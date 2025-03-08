<script setup>
// Redirect to dashboard page
const router = useRouter();
router.push("/dashboard");
</script>

<template>
  <div>Redirecting to dashboard...</div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  max-width: 800px;
  padding: 2rem;
  text-align: center;
}
</style>
