<template>
  <div class="registrars-page">
    <div
      class="content-container dashlet-wrapper"
      :class="{ 'is-empty': registrars.length === 0 }"
    >
      <div class="page-header dashlet">
        <div class="title-section">
          <h2 class="page-title heading-txt">Registrars</h2>
          <div class="profile-count pill p-grey pill-sm">
            {{
              registrars.length > 0
                ? `${registrars.length} profiles`
                : "No profiles"
            }}
          </div>
        </div>
        <div class="search-container">
          <FormInput
            id="registrar-search"
            label=""
            v-model="searchQuery"
            placeholder="Find a registrar"
            size="sm"
          >
            <template #button>
              <div class="search-icon">
                <IconsSearchIcon />
              </div>
            </template>
          </FormInput>
        </div>
      </div>
      <div
        class="registrars-list dashlet"
        :class="{ 'is-empty': registrars.length === 0 }"
      >
        <!-- Empty state for registrars -->
        <EmptyState
          v-if="registrars.length === 0"
          class="empty-state"
          title="No registrars yet"
          description="Registrars will appear here once they are added to the system."
        >
          <template #icon>
            <img
              src="~/assets/images/EmptyUser.svg"
              alt="Users Illustration"
              class="empty-state-illustration"
            />
          </template>
          <template #action>
            <Button @click="showInviteModal = true" variant="outline" size="sm">
              <template #icon>
                <PlusIcon />
              </template>
              Add Registrar
            </Button>
          </template>
        </EmptyState>

        <!-- Registrar Cards -->
        <RegistrarCard
          v-else
          v-for="(registrar, index) in registrars"
          :key="index"
          :registrar="registrar"
          @deactivate="showDeactivateDialog(registrar)"
          @suspend="showSuspendDialog(registrar)"
          @delete="showDeleteDialog(registrar)"
          @activate="activateRegistrar(registrar)"
          @unsuspend="unsuspendRegistrar(registrar)"
        />
      </div>
    </div>
    <div
      class="pending-invites dashlet-wrapper"
      v-if="registrars.length > 0 || pendingInvites.length > 0"
    >
      <div class="invites-header dashlet">
        <h2 class="invites-title">Pending Invites</h2>
        <button class="add-button" @click="showInviteModal = true">
          <IconsPlusIcon />
        </button>
      </div>

      <div class="invites-list dashlet">
        <!-- Empty state for pending invites -->
        <EmptyState
          v-if="pendingInvites.length === 0"
          title="No pending invites"
          description="Invites you send to registrars will appear here."
        >
          <template #action>
            <Button @click="showInviteModal = true" variant="outline" size="sm">
              <template #icon>
                <PlusIcon />
              </template>
              Send Invite
            </Button>
          </template>
        </EmptyState>

        <!-- Invite Items -->
        <template v-else>
          <InviteItem
            v-for="(invite, index) in pendingInvites"
            :key="index"
            :invite="invite"
            @cancel="showCancelInviteDialog"
            @resend="handleResendInvite"
          />
        </template>
      </div>
    </div>

    <!-- Toast Container -->
    <ToastContainer />

    <!-- Modals -->
    <InviteModal
      v-model="showInviteModal"
      :loading="isInviteSending"
      :pendingInvites="pendingInvites"
      @send="sendInvites"
    />

    <!-- Dialogs -->
    <Dialog
      v-model="showDeactivateConfirm"
      title="Remove Registrar?"
      message="This action cannot be undone. The registrar will be permanently removed from the system."
      variant="danger"
      :loading="isActionLoading"
      confirm-button-text="Remove"
      @confirm="confirmDeactivate"
    />

    <Dialog
      v-model="showSuspendConfirm"
      title="Suspend Registrar?"
      message="This registrar will be suspended temporarily. They will not be able to access the system until you remove the suspension."
      variant="warning"
      :loading="isActionLoading"
      confirm-button-text="Suspend"
      @confirm="confirmSuspend"
    />

    <!-- Add Dialog for Cancelling Invite -->
    <Dialog
      v-model="showCancelInviteConfirm"
      title="Cancel Invite?"
      message="Are you sure you want to cancel this invite? The registrar will not be able to join your team."
      variant="warning"
      :loading="isActionLoading"
      confirm-button-text="Cancel Invite"
      @confirm="handleCancelInvite"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from "vue";
import Button from "~/components/ui/Button.vue";
import FormInput from "~/components/ui/FormInput.vue";
import RegistrarCard from "~/components/RegistrarCard.vue";
import InviteItem from "~/components/InviteItem.vue";
import EmptyState from "~/components/ui/EmptyState.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import ToastContainer from "~/components/ui/ToastContainer.vue";
import Dialog from "~/components/ui/Dialog.vue";
import InviteModal from "~/components/InviteModal.vue";
import { useToast } from "~/composables/useToast";

interface Registrar {
  name: string;
  email: string;
  avatar: string;
  status: string;
  enrollRequests: number;
  approvals: number;
  denials: number;
}

interface Invite {
  email: string;
  date: string;
}

definePageMeta({
  layout: "dashboard",
});

// Provide a global state for tracking the currently open dropdown
const openDropdownId = ref<Symbol | null>(null);
provide("openDropdownId", openDropdownId);

const searchQuery = ref<string>("");
const toast = useToast();

// Modal and dialog state
const showInviteModal = ref(false);
const showDeactivateConfirm = ref(false);
const showSuspendConfirm = ref(false);
const showDeleteConfirm = ref(false);
const isInviteSending = ref(false);
const isActionLoading = ref(false);
const selectedRegistrar = ref<Registrar | null>(null);
const showCancelInviteConfirm = ref(false);
const selectedInvite = ref<Invite | null>(null);

// Show dialogs
const showDeactivateDialog = (registrar: Registrar) => {
  selectedRegistrar.value = registrar;
  showDeactivateConfirm.value = true;
};

const showSuspendDialog = (registrar: Registrar) => {
  selectedRegistrar.value = registrar;
  showSuspendConfirm.value = true;
};

const showDeleteDialog = (registrar: Registrar) => {
  selectedRegistrar.value = registrar;
  showDeleteConfirm.value = true;
};

// Direct actions (no confirmation dialog)
const activateRegistrar = async (registrar: Registrar) => {
  isActionLoading.value = true;
  try {
    // Simulating API call with timeout
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Success case
    toast.success(`${registrar.name} has been activated`);

    // Update registrar status in the list
    const index = registrars.value.findIndex(
      (r) => r.email === registrar.email
    );
    if (index !== -1) {
      registrars.value[index].status = "Active";
    }
  } catch (error) {
    // Error case
    toast.error("Failed to activate registrar");
  } finally {
    isActionLoading.value = false;
  }
};

const unsuspendRegistrar = async (registrar: Registrar) => {
  isActionLoading.value = true;
  try {
    // Simulating API call with timeout
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Success case
    toast.success(`Suspension has been lifted for ${registrar.name}`);

    // Update registrar status in the list
    const index = registrars.value.findIndex(
      (r) => r.email === registrar.email
    );
    if (index !== -1) {
      registrars.value[index].status = "Active";
    }
  } catch (error) {
    // Error case
    toast.error("Failed to lift suspension");
  } finally {
    isActionLoading.value = false;
  }
};

// Confirm actions
const confirmDeactivate = async () => {
  if (!selectedRegistrar.value) return;

  isActionLoading.value = true;
  try {
    // Simulating API call with timeout
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Success case
    toast.success(`${selectedRegistrar.value.name} has been deactivated`);

    // Update registrar status in the list
    const index = registrars.value.findIndex(
      (r) => r.email === selectedRegistrar.value?.email
    );
    if (index !== -1) {
      registrars.value[index].status = "Deactivated";
    }
  } catch (error) {
    // Error case
    toast.error("Failed to deactivate registrar");
  } finally {
    isActionLoading.value = false;
    showDeactivateConfirm.value = false;
  }
};

const confirmSuspend = async () => {
  if (!selectedRegistrar.value) return;

  isActionLoading.value = true;
  try {
    // Simulating API call with timeout
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Success case
    toast.success(`${selectedRegistrar.value.name} has been suspended`);

    // Update registrar status in the list
    const index = registrars.value.findIndex(
      (r) => r.email === selectedRegistrar.value?.email
    );
    if (index !== -1) {
      registrars.value[index].status = "Suspended";
    }
  } catch (error) {
    // Error case
    toast.error("Failed to suspend registrar");
  } finally {
    isActionLoading.value = false;
    showSuspendConfirm.value = false;
  }
};

// Handle invite actions
const showCancelInviteDialog = (invite: Invite) => {
  selectedInvite.value = invite;
  showCancelInviteConfirm.value = true;
};

const handleCancelInvite = async () => {
  if (!selectedInvite.value) return;

  try {
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Remove from pending invites
    pendingInvites.value = pendingInvites.value.filter(
      (i) => i.email !== selectedInvite.value?.email
    );

    // Show success toast
    toast.success(`Invite to ${selectedInvite.value.email} has been cancelled`);
  } catch (error) {
    toast.error("Failed to cancel invite");
  } finally {
    showCancelInviteConfirm.value = false;
    selectedInvite.value = null;
  }
};

const handleResendInvite = async (invite: Invite) => {
  try {
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Show success toast
    toast.success(`Invite resent to ${invite.email}`);
  } catch (error) {
    toast.error("Failed to resend invite");
  }
};

const sendInvites = async (emails: string[]) => {
  isInviteSending.value = true;

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Add new invites to the pending invites list
    const today = new Date();
    const formattedDate = `${today.getDate()}${getOrdinalSuffix(
      today.getDate()
    )} ${
      [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][today.getMonth()]
    }, ${today.getFullYear()}`;

    const newInvites = emails.map((email) => ({
      email,
      date: formattedDate,
    }));

    pendingInvites.value = [...pendingInvites.value, ...newInvites];

    // Show success toast
    if (emails.length === 1) {
      toast.success(`Invite sent to ${emails[0]}`);
    } else {
      toast.success(`${emails.length} invites sent successfully`);
    }

    // Close the modal
    showInviteModal.value = false;
  } catch (error) {
    toast.error("Failed to send invites");
  } finally {
    isInviteSending.value = false;
  }
};

// Helper function for date formatting
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// For testing empty states, you can toggle these between empty arrays and populated data
const registrars = ref<Registrar[]>([
  {
    name: "Lana Steiner",
    email: "lanasteiner@charisma.edu.ng",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "Active",
    enrollRequests: 85,
    approvals: 41,
    denials: 24,
  },
  {
    name: "Lana Steiner",
    email: "lanasteiner@charisma.edu.ng",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "Suspended",
    enrollRequests: 85,
    approvals: 41,
    denials: 24,
  },
  {
    name: "Lana Steiner",
    email: "lanasteiner@charisma.edu.ng",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "Active",
    enrollRequests: 85,
    approvals: 41,
    denials: 24,
  },
  {
    name: "Lana Steiner",
    email: "lanasteiner@charisma.edu.ng",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "Active",
    enrollRequests: 85,
    approvals: 41,
    denials: 24,
  },
  {
    name: "Lana Steiner",
    email: "lanasteiner@charisma.edu.ng",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "Active",
    enrollRequests: 85,
    approvals: 41,
    denials: 24,
  },
  {
    name: "Lana Steiner",
    email: "lanasteiner@charisma.edu.ng",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "Deactivated",
    enrollRequests: 85,
    approvals: 41,
    denials: 24,
  },
]);

const pendingInvites = ref<Invite[]>([
  {
    email: "lanasteiner@charisma.edu.ng",
    date: "25th Oct, 2024",
  },
  {
    email: "lanasteiner@charisma.edu.ng",
    date: "25th Oct, 2024",
  },
  {
    email: "lanasteiner@charisma.edu.ng",
    date: "25th Oct, 2024",
  },
  {
    email: "lanasteiner@charisma.edu.ng",
    date: "25th Oct, 2024",
  },
  {
    email: "lanasteiner@charisma.edu.ng",
    date: "25th Oct, 2024",
  },
  {
    email: "lanasteiner@charisma.edu.ng",
    date: "25th Oct, 2024",
  },
]);

// To test different empty states, uncomment these lines:
// registrars.value = []; // Empty registrars
// pendingInvites.value = []; // Empty invites
</script>

<style lang="scss" scoped>
.registrars-page {
  height: calc(100vh - 88px); // Adjust based on your header height
  display: flex;
  gap: 10px;

  .content-container {
    flex: 1;
    min-height: 0; // Important for flex children to respect overflow
    align-self: start;
    max-height: 100%;

    &.is-empty {
      align-self: auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 16px;
      background: $white;

      .title-section {
        display: flex;
        align-items: baseline;
        gap: 8px;

        .page-title {
          font-family: $font-family-heading;
          font-size: $text-2xl;
          font-weight: 800;
          color: $gray-800;
          margin: 0;
        }

        .profile-count {
          color: $gray-600;
          font-size: $text-sm;
        }
      }
    }

    .registrars-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      align-items: start;
      overflow-y: auto;
      padding: 12px;
      border-radius: 16px;
      min-height: 200px; // Add minimum height for empty state

      &.is-empty {
        flex: 1;
      }

      // New styles to make EmptyState occupy full width
      > .empty-state {
        grid-column: 1 / -1; // Span all columns
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
      }
    }
  }

  .pending-invites {
    width: 400px;
    max-width: 100%;
    flex: 0 0 auto;
    min-height: 0;

    .invites-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;

      .invites-title {
        font-family: $font-family-heading;
        font-size: $text-base;
        font-weight: 700;
        color: $gray-800;
        margin: 0;
      }
    }

    .invites-list {
      display: flex;
      flex-direction: column;
      padding: 24px;
      overflow-y: auto;
      height: 100%;
      min-height: 200px; // Add minimum height for empty state
    }
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    height: auto; // Remove fixed height
    min-height: 100vh; // Ensure it takes at least full viewport height

    .content-container {
      flex: 1;
      min-height: 0;
      width: 100%;

      .registrars-list {
        overflow-y: visible; // Remove overflow
        // padding-bottom: 0;
      }
    }

    .pending-invites {
      width: 100%;
      flex: 1;
      overflow-y: visible; // Remove overflow
      min-height: auto;
    }
  }

  @media (max-width: 768px) {
    .page-header {
      // flex-direction: column;
      align-items: flex-start;

      .search-add-section {
        width: 100%;

        .search-container {
          flex: 1;
        }
      }
    }
  }

  @media (max-width: 640px) {
    .registrars-list {
      grid-template-columns: 1fr;
    }
  }
}
</style>
