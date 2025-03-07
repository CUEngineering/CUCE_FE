<template>
  <div class="form-field">
    <label :for="id" class="form-label">{{ label }}</label>
    <div class="input-wrapper" :class="{ 'with-button': !!$slots.button }">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
        :placeholder="placeholder"
        :required="required"
        class="form-input"
      />
      <slot name="button"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id: string;
  label: string;
  modelValue: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/main" as *;

.form-field {
  width: 100%;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-family: "DM Sans", sans-serif;
  font-weight: 500;
  color: $text-color;
}

.input-wrapper {
  position: relative;

  &.with-button {
    display: flex;
    align-items: center;

    .form-input {
      padding-right: 4rem;
    }
  }
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid $border-color;
  border-radius: 0.5rem;
  font-family: "DM Sans", sans-serif;
  font-size: 1rem;
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
}
</style>
