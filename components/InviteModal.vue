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
                <CloseCircleIcon />
              </button>
            </div>

            <div class="modal-body">
              <div class="form-field">
                <div class="form-tags" v-if="emails.length > 0">
                  <div
                    v-for="(email, index) in emails"
                    :key="email"
                    class="form-tag"
                  >
                    <span class="tag-text">{{
                      formatEmailDisplay(email)
                    }}</span>
                    <button
                      class="remove-tag"
                      @click="removeEmail(index)"
                      aria-label="Remove email"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>

                <FormInput
                  id="registrar-email"
                  ref="emailInput"
                  :label="
                    emails.length > 0 ? '' : 'Registrar email address(es)'
                  "
                  v-model="currentEmail"
                  :error="inputError"
                  placeholder="Enter email address(es)"
                  @keydown="handleKeyDown"
                  @paste="handlePaste"
                />
                <p v-if="!inputError" class="input-hint">
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
import CloseCircleIcon from "./icons/CloseCircleIcon.vue";
import FormInput from "./ui/FormInput.vue";

interface Props {
  modelValue: boolean;
  loading?: boolean;
  persistent?: boolean;
  pendingInvites?: { email: string }[];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  persistent: false,
  pendingInvites: () => [],
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "send", emails: string[]): void;
}>();

const emails = ref<string[]>([]);
const currentEmail = ref("");
const inputError = ref<string | undefined>(undefined);
const emailInput = ref<typeof FormInput | null>(null);

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isEmailInPendingInvites = (email: string): boolean => {
  return props.pendingInvites.some(
    (invite) => invite.email.toLowerCase() === email.toLowerCase()
  );
};

const isEmailAlreadyAdded = (email: string): boolean => {
  return emails.value.some(
    (existingEmail) => existingEmail.toLowerCase() === email.toLowerCase()
  );
};

const addEmail = (email: string) => {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return;

  // Clear previous error
  inputError.value = undefined;

  // Validate email format
  if (!validateEmail(trimmedEmail)) {
    inputError.value = `"${trimmedEmail}" is not a valid email address`;
    return;
  }

  // Check if already in pending invites
  if (isEmailInPendingInvites(trimmedEmail)) {
    inputError.value = `An invite has already been sent to "${trimmedEmail}"`;
    return;
  }

  // Check if already added to the current list
  if (isEmailAlreadyAdded(trimmedEmail)) {
    inputError.value = `You've already added "${trimmedEmail}" to this invite`;
    return;
  }

  // Add the email to the list
  emails.value.push(trimmedEmail);
  currentEmail.value = "";
};

const removeEmail = (index: number) => {
  emails.value.splice(index, 1);
};

const handleKeyDown = (event: KeyboardEvent) => {
  // Clear error on input
  if (inputError.value) {
    inputError.value = undefined;
  }

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

  // Don't proceed if there was an error with the current email
  if (inputError.value) return;

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
      inputError.value = undefined;
    } else {
      // Focus the input when modal opens
      setTimeout(() => {
        emailInput.value?.focus();
      }, 100);
    }
  }
);
</script>

<style lang="scss" scoped></style>
