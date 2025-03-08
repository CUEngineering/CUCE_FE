<template>
  <button
    :type="type"
    :class="[
      'base-button',
      variant,
      { 'is-loading': loading, 'is-disabled': disabled },
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <span v-if="$slots.icon" class="button-icon">
      <slot name="icon" />
    </span>
    <span :class="{ 'opacity-0': loading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
}

defineProps<Props>();
defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();
</script>

<style lang="scss" scoped>
.base-button {
  cursor: pointer;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  font-family: $font-family;
  padding: 16px 24px;
  transition: all 0.2s ease;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  &.primary {
    background-color: $primary-color;
    color: white;

    &:hover:not(:disabled) {
      background-color: darken-color($primary-color, 5%);
    }
  }

  &.secondary {
    background-color: $secondary-color;
    color: white;

    &:hover:not(:disabled) {
      background-color: darken-color($secondary-color, 5%);
    }
  }

  &.outline {
    background-color: transparent;
    border: 1px solid $border-color;
    color: $text-color;

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  &.is-disabled,
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.button-icon {
  display: inline-flex;
  margin-right: 0.5rem;
  width: 1rem;
  height: 1rem;
  align-items: center;

  svg {
    width: 100%;
    height: 100%;
  }
}

.loading-spinner {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  from {
    transform: translateX(-50%) rotate(0deg);
  }
  to {
    transform: translateX(-50%) rotate(360deg);
  }
}
</style>
