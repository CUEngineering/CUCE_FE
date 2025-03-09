<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="onOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="modal">
            <div class="modal-header">
              <div class="header-content">
                <h2 class="modal-title">Send an Invite</h2>
                <p class="modal-subtitle">
                  Invite a registrar to your team to streamline student support.
                </p>
              </div>
              <button class="close-button" @click="close" aria-label="Close">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <div class="form-field">
                <label for="registrar-email" class="form-label"
                  >Registrar email address</label
                >

                <div class="email-tags" v-if="emails.length > 0">
                  <div
                    v-for="(email, index) in emails"
                    :key="email"
                    class="email-tag"
                  >
                    <span class="email-text">{{
                      formatEmailDisplay(email)
                    }}</span>
                    <button
                      class="remove-tag"
                      @click="removeEmail(index)"
                      aria-label="Remove email"
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
                </div>

                <div class="input-wrapper">
                  <input
                    id="registrar-email"
                    ref="emailInput"
                    v-model="currentEmail"
                    type="text"
                    class="form-input"
                    placeholder="Enter email address(es)"
                    @keydown="handleKeyDown"
                    @paste="handlePaste"
                  />
                </div>

                <p class="input-hint">
                  Invite multiple registrars by separating email addresses with
                  a comma.
                </p>
              </div>
            </div>

            <div class="modal-footer">
              <Button
                variant="primary"
                :disabled="emails.length === 0 || loading"
                :loading="loading"
                @click="sendInvite"
              >
                Send Invite
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Button from "./ui/Button.vue";

interface Props {
  modelValue: boolean;
  loading?: boolean;
  persistent?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  persistent: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "send", emails: string[]): void;
}>();

const emails = ref<string[]>([]);
const currentEmail = ref("");
const emailInput = ref<HTMLInputElement | null>(null);

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const addEmail = (email: string) => {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return;

  if (validateEmail(trimmedEmail) && !emails.value.includes(trimmedEmail)) {
    emails.value.push(trimmedEmail);
  }
  currentEmail.value = "";
};

const removeEmail = (index: number) => {
  emails.value.splice(index, 1);
};

const handleKeyDown = (event: KeyboardEvent) => {
  // Add email when comma or Enter is pressed
  if (event.key === "," || event.key === "Enter") {
    event.preventDefault();
    addEmail(currentEmail.value);
  }
  // Remove last email when Backspace is pressed and input is empty
  else if (
    event.key === "Backspace" &&
    currentEmail.value === "" &&
    emails.value.length > 0
  ) {
    emails.value.pop();
  }
};

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pastedText = event.clipboardData?.getData("text") || "";

  // Split by commas or semicolons or newlines
  const pastedEmails = pastedText.split(/[,;\n]/);

  pastedEmails.forEach((email) => {
    addEmail(email);
  });
};

const formatEmailDisplay = (email: string): string => {
  // If email is too long, truncate it with ellipsis
  if (email.length > 25) {
    const parts = email.split("@");
    const username = parts[0];
    const domain = parts[1];

    if (username.length > 12) {
      return username.substring(0, 6) + "..." + "@" + domain;
    }
  }
  return email;
};

const sendInvite = () => {
  if (currentEmail.value.trim()) {
    addEmail(currentEmail.value);
  }

  if (emails.value.length > 0) {
    emit("send", emails.value);
  }
};

const close = () => {
  emit("update:modelValue", false);
};

const onOverlayClick = () => {
  if (!props.persistent && !props.loading) {
    close();
  }
};

// Reset form when modal is closed
watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      emails.value = [];
      currentEmail.value = "";
    } else {
      // Focus the input when modal opens
      setTimeout(() => {
        emailInput.value?.focus();
      }, 100);
    }
  }
);
</script>

<style lang="scss" scoped>
.modal-overlay {
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
  padding: 16px;
}

.modal-container {
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
}

.modal {
  background-color: $white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0px 24px 48px -12px rgba(16, 24, 40, 0.18);
}

.modal-header {
  padding: 32px 32px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .header-content {
    flex: 1;
  }

  .modal-title {
    font-family: $font-family-heading;
    font-weight: 700;
    font-size: $text-xl;
    color: $gray-800;
    margin: 0 0 8px 0;
  }

  .modal-subtitle {
    font-family: $font-family;
    font-size: $text-sm;
    color: $gray-600;
    margin: 0;
    line-height: 1.5;
  }

  .close-button {
    background: none;
    border: none;
    color: $gray-500;
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-left: 16px;
    transition: all 0.2s ease;

    &:hover {
      color: $gray-700;
      background-color: $gray-100;
    }
  }
}

.modal-body {
  padding: 32px;

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-label {
    font-family: $font-family;
    font-weight: 500;
    font-size: $text-sm;
    color: $gray-800;
  }

  .email-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
  }

  .email-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px 4px 10px;
    background-color: $primary-color-50;
    border: 1px solid $primary-color-200;
    border-radius: 20px;
    font-size: $text-sm;
    font-family: $font-family;
    font-weight: 500;

    .email-text {
      color: $primary-color-700;
    }

    .remove-tag {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: $primary-color-400;
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover {
        color: $primary-color-700;
        background-color: rgba($primary-color, 0.1);
      }

      svg {
        width: 14px;
        height: 14px;
      }
    }
  }

  .input-wrapper {
    width: 100%;
  }

  .form-input {
    width: 100%;
    padding: 16px 14px;
    border: 1px solid $gray-300;
    border-radius: 16px;
    font-family: $font-family;
    font-size: $text-base;
    color: $gray-800;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: $primary-color-400;
      box-shadow: 0 0 0 4px rgba($primary-color, 0.1);
    }

    &::placeholder {
      color: $gray-500;
    }
  }

  .input-hint {
    font-family: $font-family;
    font-size: $text-sm;
    color: $gray-600;
    margin: 0;
    line-height: 1.5;
  }
}

.modal-footer {
  padding: 0 32px 32px;
  display: flex;
  justify-content: flex-end;

  button {
    min-width: 120px;
    border-radius: 12px;
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: $breakpoint-md) {
  .modal-container {
    max-width: 100%;
  }

  .modal {
    border-radius: 16px;
  }

  .modal-header {
    padding: 24px 24px 0;
  }

  .modal-body {
    padding: 24px;
  }

  .modal-footer {
    padding: 0 24px 24px;
  }
}
</style>
