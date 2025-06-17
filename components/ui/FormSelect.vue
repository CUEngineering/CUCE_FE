<template>
  <div class="form-field">
    <label :for="id" class="form-label">{{ label }}</label>
    <div class="input-wrapper">
      <select
        :id="id"
        :value="modelValue"
        @change="
          $emit('update:modelValue', ($event.target as HTMLSelectElement).value)
        "
        :required="required"
        class="form-select"
        :class="[size, { 'has-error': error }]"
      >
        <option disabled value="">{{ placeholder }}</option>
        <option
          v-for="(option, index) in options"
          :key="index"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <IconsChevronDownIcon class="dropdown-icon" />
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
    options: { label: string; value: string }[];
    placeholder?: string;
    required?: boolean;
    size?: "sm" | "md";
    error?: string;
  }>(),
  {
    placeholder: "Select an option",
    size: "md",
    error: undefined,
  }
);

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<style lang="scss" scoped>
.input-wrapper {
  position: relative;

  .dropdown-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: $text-color;
    width: 1rem;
    height: 1rem;
  }
}

.form-select {
  width: 100%;
  border: 1px solid $border-color;
  border-radius: 12px;
  font-family: $font-family;
  color: $text-color;
  transition: all 0.2s ease;
  background-color: white;
  appearance: none;
  padding-right: 2.5rem; // space for icon

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
    padding-right: 2.5rem; // ensure spacing for icon
    font-size: $text-base;
  }

  &.sm {
    padding: 0.5rem 0.875rem;
    padding-right: 2.5rem;
    font-size: $text-sm;
  }
}
</style>
