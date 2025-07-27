<template>
  <div style="height: fit-content" class="registrars-page">
    <AdminEnrollSub />
    <div class="pending-invites dashlet-wrapper">
      <div class="invites-list dashlet">
        <p
          @click="handleNextSession"
          style="
            text-align: center;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #2a50ad;
            cursor: pointer;
          "
        >
          <PlayIcon /><span style="padding-left: 5px">Next Session</span>
        </p>
        <SessionCard
          v-if="session"
          :session="session"
          @edit-session="handleEditSession"
          @close-session="handleCloseSession"
        />
        <Dialog
          v-model="showSuspendConfirm"
          title="Close Session?"
          :message="`Are you sure you want to close ${session?.sessionName} Session? Once closed, it can no longer be opened.`"
          variant="danger"
          :loading="isActionLoading"
          confirm-button-text="Close"
          @confirm="confirmClose"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from "vue";
import PlayIcon from "../icons/PlayIcon.vue";
import Dialog from "../ui/Dialog.vue";
import AdminEnrollSub from "./AdminEnrollSub.vue";
import SessionCard from "./sessionCard.vue";

definePageMeta({
  layout: "dashboard",
});

const openDropdownId = ref<Symbol | null>(null);
provide("openDropdownId", openDropdownId);
interface Session {
  sessionId: number;
  sessionName: string;
  startDate: string;
  endDate: string;
  enrollmentDeadline: string;
  sessionStatus: string;
  numberOfOpenCourses: number;
  numberOfStudents: number;
}
const sessions = ref<Session[]>([]);
const loading = ref(false);
const sessionIndex = ref(0);
const session = computed(() => sessions.value[sessionIndex.value]); // Current session
const showSuspendConfirm = ref(false);
const { call: fetchSessions, data: currentData } = useBackendService(
  "/sessions",
  "get"
);
const registrarDataCache = useState("sessionDataCa", () => null);
const closedDataCche = useState("closedSessionCa", () => null);

const fetchData = async () => {
  await fetchSessions({ status: "not_closed" });
  registrarDataCache.value = currentData.value;
  sessions.value = currentData.value || [];
  sessionIndex.value = 0;
};
const handleNextSession = () => {
  if (sessions.value.length === 0) return;
  sessionIndex.value = (sessionIndex.value + 1) % sessions.value.length;
};
const handleCloseSession = (session: Session) => {
  showSuspendConfirm.value = true;
};
const handleEditSession = (session: Session) => {
  return navigateTo(`/admin/sessions/${session.sessionId}`);
};
const toast = useToast();
const isActionLoading = ref(false);

const confirmClose = async () => {
  const { call: confirmDeactivate } = useBackendService(
    `/sessions/${session.value?.sessionId}`,
    ""
  );

  if (!session.value) return;

  isActionLoading.value = true;
  try {
    await confirmDeactivate({ session_status: "CLOSED" });

    toast.success(`${session.value.sessionName} is now closed`);
    await fetchData();
  } catch (error) {
    // Error case
    toast.error("Failed to process");
  } finally {
    isActionLoading.value = false;
    showSuspendConfirm.value = false;
  }
};
onMounted(async () => {
  if (!closedDataCche.value && !registrarDataCache.value) {
    try {
      loading.value = true;
      await fetchData();
      loading.value = false;
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  }

  if (closedDataCche.value || registrarDataCache.value) {
    sessions.value = registrarDataCache.value || [];
  }
});
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
    height: fit-content;

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
