<template>
  <div class="empty-state">
    <div class="icon-container" v-if="icon">
      <component :is="icon" class="icon" />
    </div>
    <div v-else-if="$slots.icon" class="icon-container">
      <slot name="icon"></slot>
    </div>
    <h3 class="title">{{ title }}</h3>
    <p class="description">{{ description }}</p>
    <div class="action" v-if="$slots.action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  icon?: any; // Component reference
}>();
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  height: 100%;
  gap: 1rem;

  .icon-container {
    .icon {
      width: 48px;
      height: 48px;
      color: $gray-400;
    }
  }

  .title {
    font-family: $font-family-heading;
    font-size: $text-lg;
    font-weight: 600;
    color: $gray-800;
  }

  .description {
    font-family: $font-family;
    font-size: $text-sm;
    color: $gray-600;
    max-width: 300px;
  }
}
</style>
