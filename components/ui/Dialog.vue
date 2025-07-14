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
                  <img :src="getIconComponent" :alt="`${variant} icon`" />
                </div>
                <h3 class="dialog-title">{{ title }}</h3>
                <button
                  v-if="showCloseButton"
                  class="dialog-close"
                  @click="close"
                  aria-label="Close dialog"
                >
                  <CloseCircleIcon />
                </button>
              </div>

              <div class="dialog-content">
                <p v-if="message" class="dialog-message">{{ message }}</p>
                <slot></slot>
              </div>

              <div class="dialog-footer">
                <Button
                  v-if="showCancelButton"
                  variant="outline"
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
import SuccessIcon from "~/assets/images/Dialog_Success.svg";
import ErrorIcon from "~/assets/images/Dialog_Error.svg";
import WarningIcon from "~/assets/images/Dialog_Warning.svg";
import CloseCircleIcon from "~/components/icons/CloseCircleIcon.vue";

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
      return ErrorIcon;
  }
});

const confirmButtonVariant = computed(
  (): "primary" | "secondary" | "outline" | "danger" => {
    switch (props.variant) {
      case "danger":
        return "danger";
      case "warning":
        return "secondary";
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
  backdrop-filter: blur(2px);
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
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: calc(100vh - 32px);
  overflow: auto;
  box-shadow: 0px 24px 48px -12px rgba(16, 24, 40, 0.18);
  display: flex;
  flex-direction: column;
  padding: 36px;
  gap: 24px;

  .dialog-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    position: relative;

    .dialog-icon {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: auto;
        height: 100px;
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
      top: 0;
      right: 0;
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
        background-color: $gray-100;
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }

  .dialog-content {
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
    gap: 16px;
  }
}
</style>
