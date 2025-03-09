<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="modelValue" class="dialog-overlay" @click="onOverlayClick">
        <div class="dialog-container">
          <Transition name="dialog-scale">
            <div
              v-if="modelValue"
              class="dialog"
              :class="[variant]"
              @click.stop
              role="dialog"
              aria-modal="true"
            >
              <div class="dialog-header">
                <div
                  v-if="icon"
                  class="dialog-icon"
                  :class="`dialog-icon-${variant}`"
                >
                  <component :is="getIconComponent" />
                </div>
                <h3 class="dialog-title">{{ title }}</h3>
                <button
                  v-if="showCloseButton"
                  class="dialog-close"
                  @click="close"
                  aria-label="Close dialog"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13 1L1 13M1 1L13 13"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div class="dialog-content">
                <p v-if="message" class="dialog-message">{{ message }}</p>
                <slot></slot>
              </div>

              <div class="dialog-footer">
                <Button
                  v-if="showCancelButton"
                  :variant="variant === 'danger' ? 'outline' : 'secondary'"
                  @click="cancel"
                >
                  {{ cancelButtonText }}
                </Button>
                <Button
                  v-if="showConfirmButton"
                  :variant="confirmButtonVariant"
                  @click="confirm"
                  :loading="loading"
                >
                  {{ confirmButtonText }}
                </Button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Button from "./Button.vue";
import SuccessIcon from "../icons/SuccessIcon.vue";
import ErrorIcon from "../icons/ErrorIcon.vue";
import InfoIcon from "../icons/InfoIcon.vue";
import WarningIcon from "../icons/WarningIcon.vue";

interface Props {
  modelValue: boolean;
  title: string;
  message?: string;
  variant?: "default" | "warning" | "danger" | "success";
  icon?: boolean;
  cancelButtonText?: string;
  confirmButtonText?: string;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  showCloseButton?: boolean;
  persistent?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  icon: true,
  cancelButtonText: "Cancel",
  confirmButtonText: "Confirm",
  showCancelButton: true,
  showConfirmButton: true,
  showCloseButton: true,
  persistent: false,
  loading: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "cancel"): void;
  (e: "confirm"): void;
}>();

const close = () => {
  emit("update:modelValue", false);
};

const cancel = () => {
  emit("cancel");
  if (!props.loading) {
    close();
  }
};

const confirm = () => {
  emit("confirm");
  if (!props.loading) {
    close();
  }
};

const onOverlayClick = () => {
  if (!props.persistent && !props.loading) {
    cancel();
  }
};

const getIconComponent = computed(() => {
  switch (props.variant) {
    case "success":
      return SuccessIcon;
    case "danger":
      return ErrorIcon;
    case "warning":
      return WarningIcon;
    case "default":
    default:
      return InfoIcon;
  }
});

const confirmButtonVariant = computed(
  (): "primary" | "secondary" | "outline" => {
    switch (props.variant) {
      case "danger":
        return "primary";
      case "warning":
        return "primary";
      case "success":
        return "primary";
      case "default":
      default:
        return "primary";
    }
  }
);
</script>

<style lang="scss" scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(16, 24, 40, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: auto;
  padding: 16px;
}

.dialog-container {
  max-width: 100%;
  width: 100%;
  max-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog {
  background-color: $white;
  border-radius: 24px;
  width: 100%;
  max-width: 480px;
  max-height: calc(100vh - 32px);
  overflow: auto;
  box-shadow: 0px 24px 48px -12px rgba(16, 24, 40, 0.18);
  display: flex;
  flex-direction: column;

  &.danger {
    .dialog-icon-danger {
      background-color: $error-50;
      color: $error-500;
    }
  }

  &.warning {
    .dialog-icon-warning {
      background-color: $warning-50;
      color: $warning-500;
    }
  }

  &.success {
    .dialog-icon-success {
      background-color: $success-50;
      color: $success-500;
    }
  }

  &.default {
    .dialog-icon-default {
      background-color: $primary-color-50;
      color: $primary-color;
    }
  }

  .dialog-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 32px 16px;
    position: relative;

    .dialog-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;

      svg {
        width: 28px;
        height: 28px;
      }
    }

    .dialog-title {
      font-family: $font-family-heading;
      font-weight: 700;
      font-size: $text-xl;
      color: $gray-800;
      text-align: center;
      margin: 0;
    }

    .dialog-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: $gray-500;
      padding: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover {
        color: $gray-700;
        background-color: $gray-100;
      }
    }
  }

  .dialog-content {
    padding: 0 32px 24px;
    overflow-y: auto;

    .dialog-message {
      font-family: $font-family;
      font-size: $text-base;
      color: $gray-600;
      text-align: center;
      margin: 0;
      line-height: 1.6;
    }
  }

  .dialog-footer {
    padding: 0 32px 32px;
    display: flex;
    justify-content: center;
    gap: 16px;

    > * {
      flex: 1;
      max-width: 200px;
    }

    button {
      border-radius: 12px;
    }
  }
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-scale-enter-active,
.dialog-scale-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.dialog-scale-enter-from,
.dialog-scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

@media (max-width: $breakpoint-md) {
  .dialog {
    max-width: 100%;

    .dialog-header {
      padding: 24px 24px 12px;
    }

    .dialog-content {
      padding: 0 24px 16px;
    }

    .dialog-footer {
      padding: 0 24px 24px;
    }
  }
}
</style>
