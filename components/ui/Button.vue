<template>
  <button
    :type="type"
    :class="[
      'base-button',
      variant,
      size,
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
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  type: "button",
  variant: "primary",
  size: "md",
  loading: false,
  disabled: false,
});

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
    background-color: $primary-color-50;
    color: $primary-color-700;
    border: 1px solid $primary-color-200;

    &:hover:not(:disabled) {
      background-color: $primary-color-100;
      border-color: $primary-color-300;
    }
  }

  &.outline {
    background-color: $white;
    color: $text-color;
    border: 1px solid $gray-300;

    &:hover:not(:disabled) {
      background-color: $primary-color-25;
      border-color: $primary-color-400;
    }
  }

  &.danger {
    background-color: $error-100;
    color: $error-700;
    border: 1px solid $error-300;

    &:hover:not(:disabled) {
      background-color: $error-50;
      border-color: $error-200;
    }
  }

  &.is-disabled,
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.sm {
    padding: 8px 16px;
    font-size: 0.75rem;
    border-radius: 8px;
    font-weight: 600;

    .button-icon svg {
      width: 14px;
      height: 14px;
    }
  }

  &.md {
    padding: 12px 20px;
    font-size: 0.875rem;
    border-radius: 10px;
  }

  &.lg {
    padding: 16px 24px;
    font-size: 0.875rem;
    border-radius: 12px;
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
