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
                <p v-if="message" class="dialog-message" v-html="message"></p>

                <slot></slot>
              </div>

              <div className="rejection-history">
                <div className="rejection-history-container">
                  <div className="rejection-history-content">
                    <div className="rejection-history-text">
                      <h3 className="rejection-history-title">
                        Rejection History
                      </h3>
                      <p className="rejection-history-subtitle">
                        This enrollment has been rejected [{{
                          props.rejectionCount
                        }}] time(s).
                      </p>
                    </div>
                  </div>

                  <div @click="viewDetails" className="rejection-history-link">
                    <span className="rejection-history-link-text"
                      >View Details -></span
                    >
                    <ChevronRight className="rejection-history-arrow" />
                  </div>
                </div>
              </div>

              <div style="margin-top: 20px" class="dialog-footer">
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
import { computed, ref } from "vue";
import ErrorIcon from "~/assets/images/Dialog_Error.svg";
import SuccessIcon from "~/assets/images/Dialog_Success.svg";
import WarningIcon from "~/assets/images/Dialog_Warning.svg";
import CloseCircleIcon from "~/components/icons/CloseCircleIcon.vue";
import Button from "../ui/Button.vue";
const toast = useToast();

const form = ref({
  reason: "",
  customReason: "",
});
const isOtherReason = computed(() => form.value.reason === "Other reason");

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
  rejectionCount?: number;
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
  (e: "viewDetails"): void;
}>();

const viewDetails = () => {
  emit("viewDetails");
};

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
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.value = { reason: "", customReason: "" };
    }
  }
);
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
.dialog-select {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .form-label {
    font-weight: 600;
    color: $gray-700;
    margin-bottom: 4px;
  }

  .form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid $border-color;
    border-radius: 12px;
    background-color: white;
    font-size: 1rem;
    font-family: $font-family;
    color: $text-color;

    &:focus {
      border-color: $primary-color;
      outline: none;
    }
  }
}

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
.rejection-history {
  background-image: url("~/assets/images/RejectImage.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  padding: 5px;
  border-radius: 10px;
  border: 1px solid #fedf89;
}

.rejection-history-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rejection-history-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.rejection-history-icon {
  width: 12px;
  height: 12px;
  background-color: #dc6803;
  transform: rotate(45deg);
  margin-top: 4px;
  flex-shrink: 0;
}

.rejection-history-text {
  display: flex;
  flex-direction: column;
}

.rejection-history-title {
  color: #101828;
  font-weight: 600;
  font-size: 15px;
  line-height: 1.2;
  margin: 0;
}

.rejection-history-subtitle {
  color: #667085;
  font-size: 12px;
  margin: 4px 0 0 0;
}

.rejection-history-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #dc6803;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.rejection-history-link:hover {
  color: #b54708;
}

.rejection-history-link-text {
  font-size: 12px;
  font-weight: 500;
}

.rejection-history-arrow {
  width: 16px;
  height: 16px;
}
</style>
