<template>
  <div
    class="programs-page dashlet-wrapper"
    :class="{ empty: !programs.length }"
  >
    <div class="page-header dashlet">
      <div class="title-and-filter">
        <h2 class="heading-txt">Courses</h2>
        <div style="margin: auto" class="web profile-count pill p-grey pill-sm">
          {{ programs.length }}
        </div>
      </div>
      <div v-if="programs.length > 0" class="search-and-actions">
        <div class="search-container">
          <FormInput
            id="program-search"
            label=""
            v-model="searchQuery"
            placeholder="Find a course"
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

    <!-- Loading state -->
    <Loader v-if="loading" />

    <EmptyState
      v-else-if="!programs.length"
      class="dashlet"
      title="Courses"
      description="There are currently no courses available for this current session at this time."
    >
      <template #icon>
        <img
          src="~/assets/images/global-education.svg"
          alt="Users Illustration"
          class="empty-state-illustration"
        />
      </template>
    </EmptyState>

    <!-- Programs table when programs exist -->
    <div
      v-else-if="programs.length > 0 && !loading"
      class="programs-content dashlet"
    >
      <table class="web-table programs-table table-container">
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
                <span v-if="header.column.getIsSorted()" class="sort-indicator">
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
            @click="viewCourseDetails(row.original)"
            class="table-row"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="table-cell"
            >
              <template v-if="typeof cell.column.columnDef.cell === 'function'">
                <div v-if="cell.column.id === 'actions'" class="action-cell">
                  <!-- Enroll button if course is open -->
                  <div v-if="row.original.availability_status === 'OPEN'">
                    <Button variant="secondary" @click="enroll(row.original)">
                      Enroll
                    </Button>
                  </div>

                  <div v-else>
                    <Button variant="yellow" @click="request(row.original)">
                      Request
                    </Button>
                  </div>
                </div>

                <div
                  v-else-if="cell.column.id === 'course_type'"
                  class="program-type-cell"
                >
                  <span
                    class="pill pill-md"
                    :class="
                      row.original.course_type.toLowerCase() === 'undergraduate'
                        ? 'p-green'
                        : row.original.course_type.toLowerCase() === 'doctorate'
                        ? 'p-yellow'
                        : 'p-blue'
                    "
                  >
                    {{
                      capitalizeFirst(row.original.course_type.toLowerCase())
                    }}
                  </span>
                </div>
                <div
                  v-else-if="cell.column.id === 'course_credits'"
                  class="courses-cell profile-count pill p-grey pill-lg"
                  style="width: fit-content"
                >
                  {{ cell.renderValue() || 0 }}
                </div>
                <div
                  v-else-if="cell.column.id === 'total_enrolled_students'"
                  class="courses-cell profile-count pill p-grey pill-lg"
                  style="width: fit-content"
                >
                  {{ cell.renderValue() || 0 }}
                </div>
                <div
                  v-else-if="cell.column.id === 'availability_status'"
                  class="status-badge"
                  :class="getStatusClass(cell.renderValue() as string)"
                >
                  <span class="status-dot"></span>
                  {{ capitalizeFirst(cell.renderValue() as string) }}
                </div>
                <div v-else>
                  {{ cell.renderValue() }}
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="mobile-table">
        <StudentMain
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          :selectedCourse="row.original"
          @viewDetails="viewCourseDetails(row.original.course_id as any)"
        />
      </div>

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

    <!-- Add Program Modal -->

    <!-- Toast Container -->
    <ToastContainer />
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
import { computed, h, onMounted, reactive, ref } from "vue";
import DotsVerticalIcon from "~/components/icons/DotsVerticalIcon.vue";
import Button from "~/components/ui/Button.vue";
import EmptyState from "~/components/ui/EmptyState.vue";
import FormInput from "~/components/ui/FormInput.vue";
import ToastContainer from "~/components/ui/ToastContainer.vue";
import { capitalizeFirst, getStatusClass } from "~/helper/formatData";

interface Course {
  course_id: string;
  course_title: string;
  course_code: string;
  course_credits: number;
  course_type: string;
  createdAt: string;
  total_enrolled_students?: number;
  availability_status?: string;
}
const authState = useAuthStore();
const loading = ref(false);
const { call: fetchPrograms, data: programsData } = useBackendService(
  `/courses/eligible/${authState.user?.student_id}`,
  "get"
);

const programs = ref<Course[]>([]);

const programsDataCache = useState<any>("courseDataSTD", () => null);

const fetchData = async () => {
  await fetchPrograms();

  programsDataCache.value = programsData.value;
  if (programsData.value && Array.isArray(programsData.value)) {
    programs.value = programsData.value.map((program: any) => ({
      ...program,
    }));
  }
};

onMounted(async () => {
  if (!programsDataCache.value) {
    try {
      loading.value = true;
      await fetchData();
      loading.value = false;
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  }

  if (programsDataCache.value) {
    if (programsDataCache.value && Array.isArray(programsDataCache.value)) {
      programs.value = programsDataCache.value.map((program: any) => ({
        ...program,
      }));
    }
  }
});

const columnHelper = createColumnHelper<Course>();

const columns = [
  columnHelper.accessor("course_title", {
    header: "Course Title",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("course_code", {
    header: "Course Code",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("total_enrolled_students", {
    header: "Enrolled Students",
    cell: (props) => props.getValue() || 0,
  }),
  columnHelper.accessor("course_type", {
    header: "Course Type",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("course_credits", {
    header: "Credits Value",
    cell: (props) => props.getValue() || 0,
  }),
  columnHelper.accessor("availability_status", {
    header: "Course Status",
    cell: (props) => props.getValue() || 0,
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
          },
          class: "action-button",
        },
        h(DotsVerticalIcon)
      );
    },
  }),
];

const tableState = reactive({
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  sorting: [] as ColumnSort[],
  globalFilter: "",
});

// Keep searchQuery in sync with globalFilter
const searchQuery = computed({
  get: () => tableState.globalFilter,
  set: (value) => {
    tableState.globalFilter = value;
  },
});

// Create table instance
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

const goToPage = (pageIndex: number) => {
  table.setPageIndex(pageIndex);
};

const selectedCourse = ref<Course | null>(null);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showInfoModal = ref(false);
const isActionLoading = ref(false);
const toast = useToast();

const enroll = async (rowData: Course) => {
  selectedCourse.value = rowData;
  showEditModal.value = true;
};

const request = async (rowData: Course) => {
  selectedCourse.value = rowData;
  showDeleteModal.value = true;
};
const viewCourseDetails = async (rowData: Course) => {
  selectedCourse.value = rowData;
  showInfoModal.value = true;
};
const handleDeleteAction = async ({
  reason,
  customReason,
}: {
  reason: string;
  customReason: string;
}) => {
  const { call } = useBackendService(`/enrollments/${selectedCourse}`, "patch");
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
    selectedCourse.value = null;
  } catch (error) {
    toast.error("Failed to reject enrollment");
  } finally {
    isActionLoading.value = false;
  }
};
const handleEditAction = async () => {
  const { call } = useBackendService(`/enrollments/`, "patch");

  isActionLoading.value = true;
  try {
    await call({
      enrollment_status: "APPROVED",
    });
    toast.success("Enrollment accepted successfully");
    fetchData();

    showEditModal.value = false;
    selectedCourse.value = null;
  } catch (error) {
    toast.error("Failed to reject enrollment");
  } finally {
    isActionLoading.value = false;
  }
};

// Define that this page uses the dashboard layout
definePageMeta({
  layout: "student",
});
</script>

<style lang="scss" scoped>
.programs-page {
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

  // Loading state
  .loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;

    .loading-spinner {
      font-size: $text-lg;
      color: $gray-600;
    }
  }

  // Table styles
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
</style>
