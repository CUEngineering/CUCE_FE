<template>
  <div class="registrars-page">
    <div
      class="content-container dashlet-wrapper"
      :class="{ 'is-empty': filteredRegistrars.length === 0 }"
    >
      <div class="page-header dashlet">
        <div class="title-section">
          <h2 class="page-title heading-txt">Sessions</h2>
        </div>
        <div class="search-container search-and-actions">
          <FormInput
            id="registrar-search"
            label=""
            v-model="searchQuery"
            placeholder="Search a Session"
            size="sm"
          >
            <template #button>
              <div class="search-icon">
                <IconsSearchIcon />
              </div>
            </template>
          </FormInput>
          <Button @click="openNewModal" variant="primary" size="sm">
            <template #icon>
              <PlusIcon />
            </template>
            New Session
          </Button>
        </div>
      </div>
      <div
        class="registrars-list dashlet"
        :class="{ 'is-empty': filteredRegistrars.length === 0 }"
      >
        <Loader v-if="loadingRegistrars" />
        <!-- Empty state for registrars -->
        <EmptyState
          v-if="filteredRegistrars.length === 0"
          class="empty-state"
          title="No Sessions"
          description="To begin, kindly create a new session."
        >
          <template #icon>
            <img
              src="~/assets/images/session.svg"
              alt="Users Illustration"
              class="empty-state-illustration"
            />
          </template>
          <template #action>
            <Button @click="showInviteModal = true" variant="outline" size="sm">
              <template #icon>
                <PlusIcon />
              </template>
              New Session
            </Button>
          </template>
        </EmptyState>

        <!-- Registrar Cards -->
        <RegistrarCard
          v-else
          v-for="(registrar, index) in filteredRegistrars"
          :key="index"
          :registrar="registrar"
          @deactivate="showDeactivateDialog(registrar)"
          @suspend="showSuspendDialog(registrar)"
          @delete="showDeleteDialog(registrar)"
          @activate="activateRegistrar(registrar)"
          @unsuspend="unsuspendRegistrar(registrar)"
        />
      </div>
      <div
        v-if="filteredRegistrars.length > 0"
        class="programs-content dashlet"
      >
        <div
          style="
            padding: 15px;
            display: flex;
            flex-direction: row;
            align-items: center;
          "
          class="title-section"
          sty
        >
          <h2 class="page-title heading-txt">Past Sessions</h2>
          <div
            style="width: fit-content; margin-left: 5px"
            class="profile-count pill p-grey pill-sm"
          >
            {{
              filteredRegistrars.length > 0
                ? `${filteredRegistrars.length}`
                : "No past sessions"
            }}
          </div>
        </div>
        <table class="programs-table table-container">
          <thead>
            <tr>
              <th
                v-for="header in table.getHeaderGroups()[0].headers"
                :key="header.id"
                @click="header.column.getToggleSortingHandler()"
                class="table-header"
              >
                <div class="header-content">
                  {{ header.column.columnDef.header }}
                  <span
                    v-if="header.column.getIsSorted()"
                    class="sort-indicator"
                  >
                    {{ header.column.getIsSorted() === "desc" ? "▼" : "▲" }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              class="table-row"
            >
              <td
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="table-cell"
              >
                <template
                  v-if="typeof cell.column.columnDef.cell === 'function'"
                >
                  <div v-if="cell.column.id === 'actions'" class="action-cell">
                    <button class="action-button">
                      <DotsVerticalIcon />
                    </button>
                  </div>
                  <div
                    v-else-if="cell.column.id === 'courses'"
                    class="courses-cell"
                  >
                    {{ cell.renderValue() }}
                  </div>
                  <div
                    v-else-if="cell.column.id === 'type'"
                    class="program-type-cell"
                  >
                    <span
                      class="pill pill-md"
                      :class="
                        row.original.type.toLowerCase() === 'undergraduate'
                          ? 'p-green'
                          : row.original.type.toLowerCase() === 'doctorate'
                          ? 'p-yellow'
                          : 'p-blue'
                      "
                    >
                      {{ row.original.type }}
                    </span>
                  </div>
                  <div v-else>
                    {{ cell.renderValue() }}
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination">
          <div class="pagination-controls">
            <button
              @click="table.previousPage()"
              :disabled="!table.getCanPreviousPage()"
              class="pagination-button"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 12L6 8L10 4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Previous
            </button>
            <div class="pagination-pages">
              <button
                v-for="page in calculatePageRange()"
                :key="page"
                @click="goToPage(page - 1)"
                class="page-button"
                :class="{
                  active: table.getState().pagination.pageIndex === page - 1,
                }"
              >
                {{ page }}
              </button>
            </div>
            <button
              @click="table.nextPage()"
              :disabled="!table.getCanNextPage()"
              class="pagination-button"
            >
              Next
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 4L10 8L6 12"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
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
  </div>
</template>

<script setup lang="ts">
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnSort,
} from "@tanstack/vue-table";
import { provide, ref } from "vue";
import DotsVerticalIcon from "~/components/icons/DotsVerticalIcon.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import InviteModal from "~/components/InviteModal.vue";
import RegistrarCard from "~/components/RegistrarCard.vue";
import Button from "~/components/ui/Button.vue";
import Dialog from "~/components/ui/Dialog.vue";
import EmptyState from "~/components/ui/EmptyState.vue";
import FormInput from "~/components/ui/FormInput.vue";
import ToastContainer from "~/components/ui/ToastContainer.vue";
import { useToast } from "~/composables/useToast";
import { formatInvitees, formatRegistrars } from "~/helper/formatData";

interface Registrar {
  id: number;
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
  // middleware: ["auth"],
});
const openNewModal = () => {
  showInviteModal.value = true;
};

const openDropdownId = ref<Symbol | null>(null);
provide("openDropdownId", openDropdownId);

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

const {
  call: fetchRegistrars,
  isLoading: loadingRegistrars,
  data: registrarData,
} = useBackendService("/registrars", "get");
const {
  call: fetchInvites,
  isLoading: loadingInvites,
  data: inviteData,
} = useBackendService("/invitations", "get");

const registrars = ref<Registrar[]>([]);
const pendingInvites = ref<Invite[]>([]);

const filteredRegistrars = computed(() => {
  if (!searchQuery.value.trim()) return registrars.value;
  const query = searchQuery.value.toLowerCase();
  return registrars.value.filter((registrar) =>
    registrar.name.toLowerCase().includes(query)
  );
});

onMounted(async () => {
  try {
    await fetchRegistrars();
    registrars.value = formatRegistrars(registrarData.value || []);
    await fetchInvites();
    pendingInvites.value = formatInvitees(inviteData.value || []);
  } catch (err) {
    console.error("Failed to fetch data:", err);
  }
});

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
  const {
    call: activateRegistrar,
    isLoading: loadingActivateRegistrar,
    data: activateRegistrarData,
  } = useBackendService(`/registrars/${registrar.id}/unsuspend`, "patch");

  isActionLoading.value = true;
  try {
    await activateRegistrar();
    // await new Promise((resolve) => setTimeout(resolve, 1000));

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
  const {
    call: unsuspendRegistrar,
    isLoading: loadingUnsuspendRegistrar,
    data: unsuspendRegistrarData,
  } = useBackendService(`/registrars/${registrar.id}/unsuspend`, "patch");

  isActionLoading.value = true;
  try {
    await unsuspendRegistrar();
    // Simulating API call with timeout
    // await new Promise((resolve) => setTimeout(resolve, 1000));

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
  const {
    call: confirmDeactivate,
    isLoading: loadingConfirmDeactivate,
    data: confirmDeactivateData,
  } = useBackendService(
    `/registrars/${selectedRegistrar.value?.id}/deactivate`,
    "patch"
  );

  if (!selectedRegistrar.value) return;

  isActionLoading.value = true;
  try {
    await confirmDeactivate();
    // Simulating API call with timeout
    // await new Promise((resolve) => setTimeout(resolve, 1000));

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
  const {
    call: confirmSuspend,
    isLoading: loadingConfirmSuspend,
    data: confirmSuspendData,
  } = useBackendService(
    `/registrars/${selectedRegistrar.value?.id}/suspend`,
    "patch"
  );
  if (!selectedRegistrar.value) return;

  isActionLoading.value = true;
  try {
    await confirmSuspend();
    // Simulating API call with timeout
    // await new Promise((resolve) => setTimeout(resolve, 1000));

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
  const {
    call: handleCancelInvite,
    isLoading: loadingCancelInvite,
    data: cancelInviteData,
  } = useBackendService("/registrars/delete-invite", "post");

  if (!selectedInvite.value) return;

  try {
    await handleCancelInvite({ email: selectedInvite.value?.email });
    // Simulating API call
    // await new Promise((resolve) => setTimeout(resolve, 500));

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

const sendInvites = async (emails: string[]) => {
  const {
    call: sendInvites,
    isLoading: loadingSendInvites,
    data: sendInvitesData,
  } = useBackendService("/registrars/invite", "post");
  isInviteSending.value = true;

  try {
    console.log(emails);
    await sendInvites({ emails });

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
interface Program {
  id: number;
  name: string;
  enrolledStudents: number;
  courses: number;
  coreCount: number;
  type: string;
  credits: number;
}
const programs = ref<Program[]>([
  {
    id: 1,
    name: "Master of Science in Psychology",
    enrolledStudents: 36,
    courses: 12,
    coreCount: 14,
    type: "Undergraduate",
    credits: 64,
  },
  {
    id: 2,
    name: "MSc. Nursing: Entry Level Clinical Track",
    enrolledStudents: 201,
    courses: 15,
    coreCount: 18,
    type: "Undergraduate",
    credits: 72,
  },
  {
    id: 3,
    name: "MSc. Nursing: Leadership and Management",
    enrolledStudents: 117,
    courses: 4,
    coreCount: 6,
    type: "Masters",
    credits: 100,
  },
  {
    id: 3,
    name: "MSc. Nursing: Leadership and Management",
    enrolledStudents: 117,
    courses: 4,
    coreCount: 6,
    type: "Masters",
    credits: 100,
  },
  {
    id: 3,
    name: "MSc. Nursing: Leadership and Management",
    enrolledStudents: 117,
    courses: 4,
    coreCount: 6,
    type: "Masters",
    credits: 100,
  },
  {
    id: 3,
    name: "MSc. Nursing: Leadership and Management",
    enrolledStudents: 117,
    courses: 4,
    coreCount: 6,
    type: "Masters",
    credits: 100,
  },
  {
    id: 3,
    name: "MSc. Nursing: Leadership and Management",
    enrolledStudents: 117,
    courses: 4,
    coreCount: 6,
    type: "Masters",
    credits: 100,
  },
  {
    id: 3,
    name: "MSc. Nursing: Leadership and Management",
    enrolledStudents: 117,
    courses: 4,
    coreCount: 6,
    type: "Masters",
    credits: 100,
  },
  {
    id: 3,
    name: "MSc. Nursing: Leadership and Management",
    enrolledStudents: 117,
    courses: 4,
    coreCount: 6,
    type: "Masters",
    credits: 100,
  },
  {
    id: 3,
    name: "MSc. Nursing: Leadership and Management",
    enrolledStudents: 117,
    courses: 4,
    coreCount: 6,
    type: "Masters",
    credits: 100,
  },
  {
    id: 3,
    name: "MSc. Nursing: Leadership and Management",
    enrolledStudents: 117,
    courses: 4,
    coreCount: 6,
    type: "Masters",
    credits: 100,
  },
  {
    id: 4,
    name: "Master of Public Health",
    enrolledStudents: 103,
    courses: 3,
    coreCount: 3,
    type: "Doctorate",
    credits: 46,
  },
  {
    id: 5,
    name: "Master of Physiotherapy",
    enrolledStudents: 201,
    courses: 3,
    coreCount: 7,
    type: "Masters",
    credits: 75,
  },
]);
const tableState = reactive({
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  sorting: [] as ColumnSort[],
  globalFilter: "",
});

const filterType = ref("all");

const columnHelper = createColumnHelper<Program>();

const columns = [
  columnHelper.accessor("name", {
    header: "Program Name",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("enrolledStudents", {
    header: "Enrolled Students",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("courses", {
    header: "Courses",
    cell: (props) => {
      const coreCount = props.row.original.coreCount;
      return `${props.getValue()} ${coreCount ? `+${coreCount} core` : ""}`;
    },
  }),
  columnHelper.accessor("type", {
    header: "Type",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("credits", {
    header: "Credits",
    cell: (props) => props.getValue(),
  }),
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: (props) => {
      return h(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            // Action logic here
          },
          class: "action-button",
        },
        h(DotsVerticalIcon)
      );
    },
  }),
];
const searchQuery = computed({
  get: () => tableState.globalFilter,
  set: (value) => {
    tableState.globalFilter = value;
  },
});
const table = useVueTable({
  get data() {
    return programs.value;
  },
  columns,
  state: tableState,
  onGlobalFilterChange: (value) => {
    tableState.globalFilter = value;
  },
  onSortingChange: (updater) => {
    const newValue =
      typeof updater === "function" ? updater(tableState.sorting) : updater;
    tableState.sorting = newValue;
  },
  onPaginationChange: (updater) => {
    const newValue =
      typeof updater === "function" ? updater(tableState.pagination) : updater;
    tableState.pagination = newValue;
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
});
const calculatePageRange = () => {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const maxVisiblePages = 8;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxVisiblePages + 1, 1);
  }

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
};

const goToPage = (pageIndex: number) => {
  table.setPageIndex(pageIndex);
};
</script>

<style lang="scss" scoped>
.registrars-page {
  height: calc(100vh - 88px); // Adjust based on your header height
  display: flex;
  gap: 10px;
  flex-direction: column;
  height: auto;
  min-height: 100vh;

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
    .search-and-actions {
      display: flex;
      gap: $spacing-2;
      width: 40vw;

      :deep(.base-button) {
        width: 20vw;
      }
    }

    .registrars-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1rem;
      align-items: start;
      overflow-y: auto;
      padding: 12px;
      border-radius: 16px;
      min-height: 200px; // Add minimum height for empty state

      &.is-empty {
        flex: 1;
      }

      > .empty-state {
        grid-column: 1 / -1; // Span all columns
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
      }
    }
  }

  .content-container {
    flex: 1;
    min-height: 0;
    width: 100%;

    .registrars-list {
      overflow-y: visible;
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
  .programs-content {
    background-color: $white;
    border-radius: 16px;
    border: 1px solid $gray-200;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    &.dashlet {
      padding: 0;
    }
  }

  .programs-table {
    .courses-cell {
      .core-count {
        display: inline-block;
        margin-left: $spacing-2;
        padding: 2px $spacing-2;
        background-color: $primary-color-100;
        color: $primary-color-700;
        border-radius: 4px;
        font-size: $text-xs;
        font-weight: 500;
      }
    }
  }

  // Pagination
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: $spacing-4;
    border-top: 1px solid $gray-200;

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: $spacing-2;
    }

    .pagination-button {
      display: flex;
      align-items: center;
      gap: $spacing-2;
      padding: $spacing-2 $spacing-3;
      border: 1px solid $gray-300;
      background-color: $white;
      border-radius: 8px;
      font-size: $text-sm;
      font-family: $font-family;
      color: $gray-700;
      cursor: pointer;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:not(:disabled):hover {
        background-color: $gray-100;
      }
    }

    .pagination-pages {
      display: flex;
      gap: 4px;
      margin: 0 $spacing-2;
    }

    .page-button {
      min-width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: none;
      background: transparent;
      font-size: $text-sm;
      color: $gray-700;
      cursor: pointer;

      &:hover {
        background-color: $gray-100;
      }

      &.active {
        background-color: $primary-color;
        color: $white;
      }
    }
  }
}
</style>
