<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" class="toast" :class="type" role="alert">
        <div v-if="icon" class="toast-icon">
          <component :is="getIconComponent" />
        </div>
        <div class="toast-content">
          <div v-if="title" class="toast-title">{{ title }}</div>
          <div class="toast-message">{{ message }}</div>
        </div>
        <button
          v-if="dismissible"
          class="toast-close"
          @click="close"
          aria-label="Close toast"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import SuccessIcon from "../icons/SuccessIcon.vue";
import ErrorIcon from "../icons/ErrorIcon.vue";
import InfoIcon from "../icons/InfoIcon.vue";
import WarningIcon from "../icons/WarningIcon.vue";

interface Props {
  message: string;
  title?: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  dismissible?: boolean;
  icon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "info",
  duration: 5000,
  dismissible: true,
  icon: true,
});

const visible = ref(false);
const emit = defineEmits<{
  (e: "close"): void;
}>();

const getIconComponent = computed(() => {
  switch (props.type) {
    case "success":
      return SuccessIcon;
    case "error":
      return ErrorIcon;
    case "warning":
      return WarningIcon;
    case "info":
    default:
      return InfoIcon;
  }
});

let timeout: number | null = null;

const close = () => {
  visible.value = false;
  emit("close");
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
};

onMounted(() => {
  visible.value = true;
  if (props.duration) {
    timeout = window.setTimeout(() => {
      close();
    }, props.duration);
  }
});
</script>

<style lang="scss" scoped>
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  min-width: 300px;
  max-width: 450px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  background-color: $white;
  box-shadow: 0px 4px 24px rgba(16, 24, 40, 0.12),
    0px 2px 8px rgba(16, 24, 40, 0.06);
  z-index: 9999;
  border: 1px solid $gray-400;

  &.success {
    border-color: $success-300;

    .toast-icon {
      color: $success-500;
      background-color: $success-50;
      border-radius: 50%;
      padding: 6px;
    }
  }

  &.error {
    border-color: $error-300;

    .toast-icon {
      color: $error-500;
      background-color: $error-50;
      border-radius: 50%;
      padding: 6px;
    }
  }

  &.warning {
    border-color: $warning-300;

    .toast-icon {
      color: $warning-500;
      background-color: $warning-50;
      border-radius: 50%;
      padding: 6px;
    }
  }

  &.info {
    border-color: $primary-color-300;

    .toast-icon {
      color: $primary-color;
      background-color: $primary-color-50;
      border-radius: 50%;
      padding: 6px;
    }
  }

  .toast-icon {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toast-content {
    flex: 1;
    min-width: 0;
  }

  .toast-title {
    font-family: $font-family-heading;
    font-weight: 600;
    font-size: $text-sm;
    color: $gray-800;
    margin-bottom: 6px;
  }

  .toast-message {
    font-family: $font-family;
    font-size: $text-sm;
    color: $gray-600;
    line-height: 1.5;
  }

  .toast-close {
    background: none;
    border: none;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: $gray-500;
    margin: -4px -4px 0 0;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      color: $gray-700;
      background-color: $gray-100;
    }
  }

  @media (max-width: $breakpoint-md) {
    left: 16px;
    right: 16px;
    max-width: calc(100% - 32px);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
    opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.toast-enter-from,
.toast-leave-to {
  transform: translateY(30px);
  opacity: 0;
}
</style>
