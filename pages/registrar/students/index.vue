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
                      <div class="dropdown">
                        <button
                          @click.stop="toggleDropdown(row.original.student_id)"
                          class="action-button"
                          aria-haspopup="true"
                          :aria-expanded="
                            openDropdownId === row.original.student_id
                          "
                        >
                          <DotsVerticalIcon />
                        </button>
                        <transition name="dropdown">
                          <div
                            v-if="openDropdownId === row.original.student_id"
                            class="dropdown-menu"
                            @click.stop
                          >
                            <button
                              @click.stop="showSuspendDialog(row.original)"
                              class="dropdown-item"
                            >
                              <span class="dropdown-icon">
                                <CloseCircleIcon />
                              </span>
                              Suspend Account
                            </button>

                            <button
                              @click.stop="showDeleteDialog(row.original)"
                              class="dropdown-item"
                            >
                              <span class="dropdown-icon">
                                <DeleteIcon />
                              </span>
                              Remove Account
                            </button>
                          </div>
                        </transition>
                      </div>
                    </div>
                    <div
                      v-else-if="cell.column.id === 'first_name'"
                      class="student-info"
                    >
                      <img
                        :src="cell.row.original.profile_picture"
                        :alt="cell.row.original.reg_number"
                        class="avatar"
                      />
                      <div class="student-details">
                        <div class="student-name">
                          {{ cell.row.original.first_name }}{{ " "
                          }}{{ cell.row.original.last_name }}
                        </div>
                        <div class="student-id">
                          @{{ cell.row.original.reg_number }}
                        </div>
                      </div>
                    </div>
                    <div v-else-if="cell.column.id === 'email'">
                      {{ cell.row.original?.program.program_name }}
                    </div>
                    <div
                      v-else-if="cell.column.id === 'reg_number'"
                      class="status-badge"
                      :class="
                        getStatusClass(cell.row.original?.program.program_type)
                      "
                    >
                      {{
                        capitalizeFirst(cell.row.original?.program.program_type)
                      }}
                    </div>
                    <div v-else-if="cell.column.id === 'last_name'">
                      <template
                        v-if="
                          cell.row.original.enrollments[0]?.registrars?.email
                        "
                      >
                        <div
                          class="student-info status-badge profile-count pill p-grey"
                          style="width: fit-content"
                        >
                          <img
                            :src="
                              cell.row.original.enrollments[0].registrars
                                .profile_picture
                            "
                            :alt="
                              cell.row.original.enrollments[0].registrars
                                .first_name
                            "
                            class="avatar"
                          />
                          <div class="student-details">
                            <div class="student-name">
                              {{
                                cell.row.original.enrollments[0].registrars
                                  .first_name
                              }}
                              {{
                                cell.row.original.enrollments[0].registrars
                                  .last_name
                              }}
                            </div>
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        <div class="">
                          <div class="">No assigned registrar</div>
                        </div>
                      </template>
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
          <StudentMobile
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :selectedCourse="row.original"
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
    </div>
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
    <Dialog
      v-model="showDeactivateConfirm"
      title="Remove Student?"
      message="This student will no longer have access to the CUCE app. To add them back, you will need to send a fresh invite."
      variant="danger"
      :loading="isActionLoading"
      confirm-button-text="Remove"
      @confirm="confirmDeactivate"
    />

    <Dialog
      v-model="showSuspendConfirm"
      title="Suspend Student?"
      message="This Student will not be able to access the app until their account is reactivated."
      variant="warning"
      :loading="isActionLoading"
      confirm-button-text="Suspend"
      @confirm="confirmSuspend"
    />
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
import CloseCircleIcon from "~/components/icons/CloseCircleIcon.vue";
import DeleteIcon from "~/components/icons/DeleteIcon.vue";
import DotsVerticalIcon from "~/components/icons/DotsVerticalIcon.vue";
import FilterIcon from "~/components/icons/FilterIcon.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import AddModal from "~/components/student/AddModal.vue";
import Button from "~/components/ui/Button.vue";
import Dialog from "~/components/ui/Dialog.vue";
import EmptyState from "~/components/ui/EmptyState.vue";
import FormInput from "~/components/ui/FormInput.vue";
import { capitalizeFirst, getStatusClass } from "~/helper/formatData";

interface Student {
  student_id: number;
  reg_number: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
  program_id: number;
  enrollments: Enrollment[];
  program: Program;
}

interface Enrollment {
  sessions: any | null;
  registrar_id: number;
  enrollment_id: number;
  registrars: Registrar;
}

interface Registrar {
  registrar_id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
}

interface Program {
  program_name: string;
  program_type: string;
  total_credits: number;
}
const toast = useToast();
const loading = ref(false);
const showInviteModal = ref(false);
const showInviteSuccessDialog = ref(false);
const showInviteFailureDialog = ref(false);
const isInviteSending = ref(false);
const showDeactivateConfirm = ref(false);
const showSuspendConfirm = ref(false);
const selectedStudent = ref<Student | null>(null);

const showSuspendDialog = (registrar: Student) => {
  selectedStudent.value = registrar;
  showSuspendConfirm.value = true;
};
const showDeleteDialog = (registrar: Student) => {
  selectedStudent.value = registrar;
  showDeactivateConfirm.value = true;
};

const confirmDeactivate = async () => {
  const {
    call: confirmDeactivate,
    isLoading: loadingConfirmDeactivate,
    data: confirmDeactivateData,
  } = useBackendService(
    `/students/${selectedStudent.value?.student_id}`,
    "delete"
  );

  if (!selectedStudent.value) return;

  isActionLoading.value = true;
  try {
    await confirmDeactivate();
    // Simulating API call with timeout
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // Success case
    toast.success(`${selectedStudent.value.first_name} has been Deleted`);

    await fetchData();
  } catch (error) {
    // Error case
    toast.error("Failed to delete student");
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
    `/students/${selectedStudent.value?.student_id}/reject`,
    "patch"
  );
  if (!selectedStudent.value) return;

  isActionLoading.value = true;
  try {
    await confirmSuspend();
    // Simulating API call with timeout
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // Success case
    toast.success(`${selectedStudent.value.first_name} has been suspended`);

    await fetchData();
  } catch (error) {
    // Error case
    toast.error("Failed to suspend student");
  } finally {
    isActionLoading.value = false;
    showSuspendConfirm.value = false;
  }
};

const handleInviteSuccess = async () => {
  showInviteModal.value = false;
  showInviteSuccessDialog.value = true;
  await fetchData();
};

const handleInviteFailure = async () => {
  showInviteModal.value = false;
  showInviteFailureDialog.value = true;
  await fetchData();
};

const openDropdownId = inject<Ref<number | null>>("openDropdownId", ref(null));

// Toggle dropdown
const toggleDropdown = (studentId: number) => {
  openDropdownId.value = openDropdownId.value === studentId ? null : studentId;
};

const { call, data } = useBackendService("/students", "get");
const enrollments = ref<Student[]>([]);
const enrollmentsDataCache = useState("studentscachTREG", () => null);
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
      header: "Student name",
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Enrolled Programme",
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor("reg_number", {
      header: "Programme Type",
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor("last_name", {
      header: "Assigned Registrar",
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

const handleSuspend = async (rowData: Student) => {
  selectedEnrollment.value = rowData;
  showEditModal.value = true;
};

const handleDelete = async (rowData: Student) => {
  selectedEnrollment.value = rowData;
  showDeleteModal.value = true;
};
const handleInfo = async (rowData: Student) => {
  ///navigate
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
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 180px;
  background-color: $white;
  border-radius: 8px;
  box-shadow: 0px 12px 16px -4px rgba(16, 24, 40, 0.08),
    0px 4px 6px -2px rgba(16, 24, 40, 0.03);
  border: 1px solid $gray-200;
  // overflow: hidden;
  z-index: 9999;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  font-family: $font-family;
  font-size: $text-sm;
  color: $gray-700;
  cursor: pointer;
  transition: background-color 0.2s;
  // overflow: hidden;
  z-index: 9999;
  &:hover {
    background-color: $gray-50;
  }

  .dropdown-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    width: 16px;
    height: 16px;
    color: $gray-500;
  }
}
.action-button {
  background: none;
  border: none;
  color: $gray-500;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
