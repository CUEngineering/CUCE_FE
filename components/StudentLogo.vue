<template>
  <div class="logo">
    <img
      :src="type === 'full' ? logoFull : logoIcon"
      :alt="type === 'full' ? 'Charisma University Logo' : 'Charisma Logo'"
      class="logo-icon"
      :class="{ 'logo-full': type === 'full' }"
    />
  </div>
</template>

<script setup lang="ts">
import logoIcon from "@/assets/images/CU_Logo.svg";
import logoFull from "@/assets/images/logost.svg";

defineProps<{
  type?: "compact" | "full"; // Add type prop
}>();
</script>

<style lang="scss" scoped>
.logo {
  display: flex;
  align-items: center;

  .logo-icon {
    width: 31px;
    height: 31px;

    &.logo-full {
      width: auto; // Let the full logo maintain its aspect ratio
      height: 31px; // Keep the same height as compact version
    }
  }
}
</style>
