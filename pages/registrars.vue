<template>
  <div class="registrars-page">
    <div
      class="content-container dashlet-wrapper"
      :class="{ 'is-empty': registrars.length === 0 }"
    >
      <div class="page-header dashlet">
        <div class="title-section">
          <h1 class="page-title">Registrars</h1>
          <div class="profile-count pill-grey">
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
            <Button variant="secondary" size="sm">
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
        />
      </div>
    </div>
    <div
      class="pending-invites dashlet-wrapper"
      v-if="registrars.length > 0 || pendingInvites.length > 0"
    >
      <div class="invites-header dashlet">
        <h2 class="invites-title">Pending Invites</h2>
        <button class="add-button">
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
            <Button variant="secondary" size="sm">
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
            @cancel="handleCancelInvite"
            @resend="handleResendInvite"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Button from "~/components/ui/Button.vue";
import FormInput from "~/components/ui/FormInput.vue";
import RegistrarCard from "~/components/RegistrarCard.vue";
import InviteItem from "~/components/InviteItem.vue";
import EmptyState from "~/components/ui/EmptyState.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";

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

const searchQuery = ref<string>("");

// Handle cancel invite
function handleCancelInvite(invite: Invite): void {
  // In the future, this would call an API to cancel the invite
  console.log("Cancel invite:", invite);
}

// Handle resend invite
function handleResendInvite(invite: Invite): void {
  // In the future, this would call an API to resend the invite
  console.log("Resend invite:", invite);
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
registrars.value = []; // Empty registrars
pendingInvites.value = []; // Empty invites
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

      .search-container {
        position: relative;
        width: 300px;

        .search-icon {
          width: 16px;
          display: flex;
        }

        // Override FormInput styling
        :deep(.form-field) {
          gap: 0;
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

      .add-button {
        background-color: $primary-color-700;
        color: white;
        border: none;
        border-radius: 0.375rem;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0px 12px 16px -4px rgba(16, 24, 40, 0.08),
          0px 4px 6px -2px rgba(16, 24, 40, 0.03);
        padding: 4px;
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
        padding-bottom: 0;
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

.empty-state-illustration {
  width: 200px;
  height: 200px;
  margin-left: 1rem;
}
</style>
