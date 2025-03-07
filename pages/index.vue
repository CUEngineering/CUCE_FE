<script setup>
// Redirect to login page
const router = useRouter();
router.push("/login");
</script>

<template>
  <div>Redirecting to login...</div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  max-width: 800px;
  padding: 2rem;
  text-align: center;
}
</style>
