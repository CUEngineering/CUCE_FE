<template>
  <div class="form-field">
    <label :for="id" class="form-label">{{ label }}</label>
    <div
      class="input-wrapper"
      :class="{ 'with-button': !!$slots.button, 'with-icon': type === 'date' }"
    >
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        class="form-input"
        :class="[
          size,
          { 'has-error': error, 'with-icon-padding': type === 'date' },
        ]"
      />

      <div class="form-icon" v-if="$slots.button">
        <slot name="button"></slot>
      </div>
    </div>
    <p v-if="error" class="input-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string;
    label: string;
    modelValue: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    size?: "sm" | "md";
    error?: string;
    disabled?: boolean;
  }>(),
  {
    type: "text",
    size: "md",
    error: undefined,
    disabled: false,
  }
);

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<style lang="scss" scoped>
.input-wrapper {
  position: relative;
}

.form-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.form-input {
  width: 100%;
  border: 1px solid $border-color;
  border-radius: 12px;
  font-family: $font-family;
  color: $text-color;
  transition: all 0.2s ease;
  background-color: white;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
  }

  &.has-error {
    border-color: $error-500;

    &:focus {
      box-shadow: 0 0 0 2px rgba($error-500, 0.1);
    }
  }

  &.md {
    padding: 0.875rem 1rem;
    font-size: $text-base;
  }

  &.sm {
    padding: 0.5rem 0.875rem;
    font-size: $text-sm;

    &::placeholder {
      font-size: $text-sm;
    }
  }
}
</style>
