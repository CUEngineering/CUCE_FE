<template>
  <div class="logo">
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="8" fill="currentColor" />
      <path d="M24 12L36 20V28L24 36L12 28V20L24 12Z" fill="white" />
      <path d="M24 18L30 22V26L24 30L18 26V22L24 18Z" fill="currentColor" />
    </svg>
    <span class="logo-text">Charisma</span>
  </div>
</template>

<style lang="scss" scoped>
.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: $primary-color;

  .logo-text {
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.025em;
  }
}
</style>
