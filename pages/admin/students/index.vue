<template>
  <div
    class="enrollments-page dashlet-wrapper"
    :class="{ empty: !enrollments.length }"
  >
    <div class="page-header dashlet">
      <div class="title-and-filter">
        <h2 class="heading-txt">Students</h2>
      </div>
      <div v-if="enrollments.length > 0" class="search-and-actions">
        <div class="search-container">
          <FormInput
            id="program-search"
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
        </div>
      </div>
    </div>
    <Loader v-if="loading" />

    <!-- Empty state for when no enrollments exist -->
    <EmptyState
      v-if="!loading && !enrollments.length"
      class="dashlet"
      title="No Students yet"
      description="Students will appear here once they are added to the system."
    >
      <template #icon>
        <img
          src="~/assets/images/EmptyProgram.svg"
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

    <!-- enrollments table when enrollments exist -->
    <div
      v-if="!loading && enrollments.length"
      class="enrollments-content dashlet program-tabs"
    >
      <div class="tabs-heading">
        <!-- Tabs for students/courses -->
        <div style="display: flex">
          <h2>Available Students</h2>
          <div
            style="margin: auto; margin-left: 20px"
            class="web profile-count pill p-grey pill-sm"
          >
            ({{ startRecord }} - {{ endRecord }}) of {{ totalRecords }}
          </div>
        </div>

        <div style="display: flex" class="web header-actions">
          <Button @click="showInviteModal = true" variant="primary" size="sm">
            <template #icon>
              <PlusIcon />
            </template>
            New Student
          </Button>
          <FilterIcon style="margin-left: 5px" class="avatar" />
        </div>
      </div>
      <div>
        <div class="web-table">
          <table class="enrollments-table table-container">
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
                @click="handleInfo(row.original)"
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
                    <div
                      v-if="cell.column.id === 'actions'"
                      class="action-cell"
                    >
                      <button
                        class="action-button delete-button"
                        @click.stop="handleDelete(row.original)"
                      >
                        <ActionCancelIcon />
                      </button>
                      <button
                        class="action-button edit-button"
                        @click.stop="handleEdit(row.original)"
                      >
                        <ActionEditIcon />
                      </button>
                    </div>

                    <div v-else>
                      {{ cell.renderValue() }}
                    </div>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mobile-table">
          <!-- <MobileEnrollment
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :selectedEnrollment="row.original"
            @activate="
              () => {
                selectedEnrollment = row.original;
                showEditModal = true;
              }
            "
            @deactivate="
              () => {
                selectedEnrollment = row.original;
                showDeleteModal = true;
              }
            "
            @viewDetails="handleInfo(row.original as Student)"
          /> -->
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
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ColumnSort } from "@tanstack/vue-table";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { computed, reactive, ref } from "vue";
import ActionCancelIcon from "~/components/icons/ActionCancelIcon.vue";
import ActionEditIcon from "~/components/icons/ActionEditIcon.vue";
import FilterIcon from "~/components/icons/FilterIcon.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import Button from "~/components/ui/Button.vue";
import EmptyState from "~/components/ui/EmptyState.vue";
import FormInput from "~/components/ui/FormInput.vue";

interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
  reg_number: string;
}
const toast = useToast();
const loading = ref(false);
const showInviteModal = ref(false);

const { call, data } = useBackendService("/students", "get");
const enrollments = ref<Student[]>([]);
const enrollmentsDataCache = useState("enrollments", () => null);
const fetchData = async () => {
  await call();
  enrollmentsDataCache.value = data.value;
  enrollments.value = data.value || [];
};
onMounted(async () => {
  if (!enrollmentsDataCache.value) {
    try {
      loading.value = true;
      await fetchData();
      loading.value = false;
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  }

  if (enrollmentsDataCache.value) {
    enrollments.value = enrollmentsDataCache.value || [];
  }
});

const columnHelper = createColumnHelper<Student>();

const columns = computed(() => {
  const cols: any[] = [
    columnHelper.accessor("first_name", {
      header: "Course",
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Enrolled Programme",
      cell: (props) => props.getValue(),
    }),
  ];

  cols.push(
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: () => {},
    })
  );

  return cols;
});

const tableState = reactive({
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  sorting: [] as ColumnSort[],
  globalFilter: "",
});

const searchQuery = computed({
  get: () => tableState.globalFilter,
  set: (value) => {
    tableState.globalFilter = value;
  },
});

const table = useVueTable({
  get data() {
    return enrollments.value;
  },
  get columns() {
    return columns.value;
  },
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

// Pagination helpers
const calculatePageRange = () => {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const maxVisiblePages = 5;

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

const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showInfoModal = ref(false);
const isActionLoading = ref(false);
const selectedEnrollment = ref<Student | null>(null);

const handleEdit = async (rowData: Student) => {
  selectedEnrollment.value = rowData;
  showEditModal.value = true;
};

const handleDelete = async (rowData: Student) => {
  selectedEnrollment.value = rowData;
  showDeleteModal.value = true;
};
const handleInfo = async (rowData: Student) => {
  selectedEnrollment.value = rowData;
  showInfoModal.value = true;
};
const handleDeleteAction = async ({
  reason,
  customReason,
}: {
  reason: string;
  customReason: string;
}) => {
  const { call } = useBackendService(
    `/enrollments/${selectedEnrollment.value}`,
    "patch"
  );
  const finalReason = reason === "Other reason" ? customReason : reason;

  isActionLoading.value = true;
  try {
    await call({
      enrollment_status: "REJECTED",
      rejection_reason: finalReason,
    });
    toast.success("Enrollment rejected successfully");
    fetchData();

    showDeleteModal.value = false;
    selectedEnrollment.value = null;
  } catch (error) {
    toast.error("Failed to reject enrollment");
  } finally {
    isActionLoading.value = false;
  }
};

const goToPage = (pageIndex: number) => {
  table.setPageIndex(pageIndex);
};

definePageMeta({
  layout: "dashboard",
});

const totalRecords = computed(() => enrollments.value.length);

const startRecord = computed(() => {
  return (
    table.getState().pagination.pageIndex *
      table.getState().pagination.pageSize +
    1
  );
});
const endRecord = computed(() => {
  const possibleEnd =
    (table.getState().pagination.pageIndex + 1) *
    table.getState().pagination.pageSize;
  return possibleEnd > totalRecords.value ? totalRecords.value : possibleEnd;
});
</script>

<style lang="scss" scoped>
.program-tabs {
  display: flex;
  flex-direction: column;

  .tabs-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-4;
    border-bottom: 1px solid $gray-200;
    gap: $spacing-4;
  }

  .tab-actions {
    display: flex;
    gap: $spacing-2;
    align-items: center;
  }

  .program-tab-title {
    display: flex;
    gap: $spacing-2;
    padding: $spacing-1;
    background-color: $gray-100;
    border-radius: 8px;
    border: 1px solid $gray-200;

    .tab-button {
      padding: $spacing-2 $spacing-8;
      background: none;
      border: none;
      border-radius: 8px;
      border-bottom: 2px solid transparent;
      color: $gray-600;
      font-weight: 400;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: $font-family;
      font-size: $text-xs;

      &:hover {
        color: $gray-900;
      }

      &.active {
        color: $primary-color-600;
        background-color: $white;
        font-weight: 600;
      }
    }
  }
}
/* ====================
   Status Badge
   ==================== */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px 1px 6px;
  border-radius: 16px;
  font-size: $text-xxs;
  font-weight: 500;
  line-height: 1.8;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-active {
  background-color: $success-50;
  color: $success-400;
  border: 1px solid $success-400;

  .status-dot {
    background-color: $success-400;
  }
}

.status-suspended {
  background-color: $primary-color-50;
  color: $primary-color-500;
  border: 1px solid $primary-color-500;

  .status-dot {
    background-color: $primary-color-500;
  }
}

.status-deactivated {
  background-color: $error-50;
  color: $error-700;
  border: 1px solid $error-200;

  .status-dot {
    background-color: $error-400;
  }
}

.student-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-details {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 600;
}

.student-id {
  font-size: 0.85rem;
  color: #777;
}

.enrollments-page {
  max-width: 100%;

  &.empty {
    height: 100%;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: $spacing-4;

    .title-and-filter {
      display: flex;
      align-items: center;
      gap: $spacing-4;
    }

    .search-and-actions {
      display: flex;
      gap: $spacing-2;

      :deep(.base-button) {
        width: unset;
      }
    }
  }

  // Table styles
  .enrollments-content {
    background-color: $white;
    border-radius: 16px;
    border: 1px solid $gray-200;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    &.dashlet {
      padding: 0;
    }
  }

  .enrollments-table {
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
  .mobile-table {
    display: none;
  }

  @media (max-width: 768px) {
    .web-table {
      display: none;
    }
    .web {
      display: none;
    }

    .mobile-table {
      display: block;
    }
  }
}
</style>
