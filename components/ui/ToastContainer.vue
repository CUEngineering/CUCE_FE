<template>
  <div class="toast-container">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :message="toast.message"
      :title="toast.title"
      :type="toast.type"
      :duration="toast.duration"
      :dismissible="toast.dismissible"
      :icon="toast.icon"
      @close="removeToast(toast.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { useToast } from "../../composables/useToast";
import Toast from "./Toast.vue";

const { toasts, removeToast } = useToast();
</script>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  padding: 24px;
  pointer-events: none;

  /* All direct children should have pointer events */
  > * {
    pointer-events: auto;
  }

  @media (max-width: $breakpoint-md) {
    left: 0;
    padding: 16px;
  }
}
</style>
