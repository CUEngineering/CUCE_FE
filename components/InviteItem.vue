<template>
  <div class="invite-item">
    <div class="invite-info">
      <div class="invite-email">{{ invite.email }}</div>
      <div class="invite-date">Invited on {{ invite.date }}</div>
    </div>
    <div class="invite-actions">
      <Button
        variant="outline"
        class="cancel-button"
        @click="$emit('cancel', invite)"
      >
        Cancel Invite
      </Button>
      <Button
        variant="outline"
        class="resend-button"
        @click="$emit('resend', invite)"
      >
        Resend Invite
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "~/components/ui/Button.vue";

interface Invite {
  email: string;
  date: string;
}

defineProps<{
  invite: Invite;
}>();

defineEmits<{
  (e: "cancel", invite: Invite): void;
  (e: "resend", invite: Invite): void;
}>();
</script>

<style lang="scss" scoped>
.invite-item {
  padding: 1rem 0;
  border-bottom: 1px solid $gray-200;

  &:last-child {
    border-bottom: none;
  }

  .invite-info {
    margin-bottom: 1rem;

    .invite-email {
      font-size: $text-sm;
      font-weight: 500;
      color: $gray-800;
      margin-bottom: 0.25rem;
    }

    .invite-date {
      font-size: $text-xs;
      color: $gray-600;
    }
  }

  .invite-actions {
    display: flex;
    gap: 0.5rem;
    background-color: $gray-50;

    // Override Button component styles
    :deep(.base-button) {
      padding: 0.8rem 1rem;
      font-size: $text-xs;
      width: auto;
    }

    .cancel-button {
      color: $error-500 !important;
      border-color: transparent !important;
      background-color: transparent !important;
    }

    .resend-button {
      color: $success-500 !important;
      border-color: transparent !important;
      background-color: transparent !important;
    }
  }
}
</style>
