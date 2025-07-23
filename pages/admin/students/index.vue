<template>
  <div class="registrars-page">
    <div
      class="content-container dashlet-wrapper"
      :class="{ 'is-empty': table.getRowModel().rows.length === 0 }"
    >
      <div class="page-header dashlet">
        <div class="title-section">
          <h2 class="page-title heading-txt">Students</h2>
          <div class="profile-count pill p-grey pill-sm">
            {{
              table.getRowModel().rows.length > 0
                ? `${table.getRowModel().rows.length} profiles`
                : "No profiles"
            }}
          </div>
        </div>
        <div
          style="display: flex; align-items: center"
          class="search-container"
        >
          <FormInput
            id="registrar-search"
            label=""
            v-model="searchQuery"
            placeholder="Find a student"
            size="sm"
          >
            <template #button>
              <div class="search-icon">
                <IconsSearchIcon />
              </div>
            </template>
          </FormInput>
          <button
            style="margin-left: 5px"
            class="add-button"
            @click="showInviteModal = true"
          >
            <IconsPlusIcon />
          </button>
        </div>
      </div>
      <div
        class="registrars-list dashlet"
        :class="{ 'is-empty': table.getRowModel().rows.length === 0 }"
      >
        <Loader v-if="loadingRegistrars" />
        <!-- Empty state for registrars -->
        <EmptyState
          v-if="table.getRowModel().rows.length === 0"
          class="empty-state"
          title="No Students yet"
          description="Students will appear here once they are added to the system."
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
              Add Student
            </Button>
          </template>
        </EmptyState>

        <StudentCard
          v-else
          v-for="row in table.getRowModel().rows"
          :key="row.index"
          :registrar="row.original"
        />
      </div>

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

    <!-- Toast Container -->
    <ToastContainer />

    <!-- Modals -->
    <AddModal
      v-model="showInviteModal"
      :loading="isInviteSending"
      @invite-success="handleInviteSuccess"
      @invite-failure="handleInviteFailure"
    />

    <Dialog
      v-model="showInviteSuccessDialog"
      title="Invites Sent!"
      message="Your invitation have been sent to the provided email address. The invited student will receive an email with a link to join the platform."
      variant="success"
      :icon="true"
      cancelButtonText="Awesome 🎉"
      confirmButtonText=""
      :showCancelButton="true"
      :showConfirmButton="false"
      :showCloseButton="true"
      :persistent="false"
      :loading="false"
    />
    <Dialog
      v-model="showInviteFailureDialog"
      title="Invite failed!"
      message="There was an issue, We’re unable to send your invite to the provided email address. Please try again."
      variant="danger"
      :icon="true"
      cancelButtonText="Try again!"
      confirmButtonText=""
      :showCancelButton="true"
      :showConfirmButton="false"
      :showCloseButton="true"
      :persistent="false"
      :loading="false"
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
import PlusIcon from "~/components/icons/PlusIcon.vue";
import AddModal from "~/components/student/AddModal.vue";
import Button from "~/components/ui/Button.vue";
import Dialog from "~/components/ui/Dialog.vue";
import EmptyState from "~/components/ui/EmptyState.vue";
import FormInput from "~/components/ui/FormInput.vue";
import ToastContainer from "~/components/ui/ToastContainer.vue";

interface Registrar {
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
  reg_number: string;
}

definePageMeta({
  layout: "dashboard",
});
const showInviteSuccessDialog = ref(false);
const showInviteFailureDialog = ref(false);

const handleInviteSuccess = () => {
  showInviteModal.value = false;
  showInviteSuccessDialog.value = true;
};

const handleInviteFailure = () => {
  showInviteModal.value = false;
  showInviteFailureDialog.value = true;
};

const openDropdownId = ref<Symbol | null>(null);
provide("openDropdownId", openDropdownId);

const searchQuery = ref<string>("");

watch(searchQuery, (value) => {
  table.setGlobalFilter(value);
});
// Modal and dialog state
const showInviteModal = ref(false);
const isInviteSending = ref(false);

const {
  call: fetchRegistrars,
  isLoading: loadingRegistrars,
  data: registrarData,
} = useBackendService("/students", "get");

const registrars = ref<Registrar[]>([]);

onMounted(async () => {
  try {
    await fetchRegistrars();
    registrars.value = registrarData.value || [];
  } catch (err) {
    console.error("Failed to fetch data:", err);
  }
});

const tableState = reactive({
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  sorting: [] as ColumnSort[],
  globalFilter: "",
});

const columnHelper = createColumnHelper<any>();

const columns = [
  columnHelper.accessor("first_name", { header: "First Name" }),
  columnHelper.accessor("last_name", { header: "Last Name" }),
  columnHelper.accessor("email", { header: "Email" }),
  columnHelper.accessor("reg_number", { header: "Reg Number" }),
];
function fuzzyFilter(row: any, columnId: string, filterValue: string) {
  const registrar = row.original;
  const query = filterValue.toLowerCase();
  return (
    registrar.first_name.toLowerCase().includes(query) ||
    registrar.last_name.toLowerCase().includes(query) ||
    registrar.email.toLowerCase().includes(query) ||
    registrar.reg_number.toLowerCase().includes(query)
  );
}

const table = useVueTable({
  get data() {
    return registrars.value;
  },
  columns,
  state: tableState,
  globalFilterFn: fuzzyFilter,
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
