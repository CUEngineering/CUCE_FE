<template>
  <div
    class="programs-page dashlet-wrapper"
    :class="{ empty: !programs.length }"
  >
    <div class="page-header dashlet">
      <div class="title-and-filter">
        <h2 class="heading-txt">Programs</h2>
        <div v-if="programs.length > 0" class="programs-filter">
          <select v-model="filterType" class="filter-select">
            <option value="all">All ({{ programs.length }})</option>
          </select>
        </div>
      </div>
      <div v-if="programs.length > 0" class="search-and-actions">
        <div class="search-container">
          <FormInput
            id="program-search"
            label=""
            v-model="searchQuery"
            placeholder="Find a program"
            size="sm"
          >
            <template #button>
              <div class="search-icon">
                <IconsSearchIcon />
              </div>
            </template>
          </FormInput>
        </div>

        <Button @click="openAddProgramModal" variant="primary" size="sm">
          <template #icon>
            <PlusIcon />
          </template>
          New Program
        </Button>
      </div>
    </div>

    <!-- Empty state for when no programs exist -->
    <Loader v-if="loading" />
    <EmptyState
      v-if="!programs.length"
      class="dashlet"
      title="No programs found"
      description="Add your first program to get started"
    >
      <template #icon>
        <img
          src="~/assets/images/EmptyProgram.svg"
          alt="Users Illustration"
          class="empty-state-illustration"
        />
      </template>
      <template #action>
        <Button @click="openAddProgramModal" variant="secondary">
          <template #icon>
            <PlusIcon />
          </template>
          Add a program
        </Button>
      </template>
    </EmptyState>

    <!-- Programs table when programs exist -->
    <div v-else class="programs-content dashlet">
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
            @click="viewProgramDetails(row.original.id)"
            class="table-row"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="table-cell"
            >
              <template v-if="typeof cell.column.columnDef.cell === 'function'">
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

    <!-- Add Program Modal -->
    <AddProgramModal
      v-if="showAddProgramModal"
      v-model="showAddProgramModal"
      @program-added="handleProgramAdded"
    />

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
import { computed, h, reactive, ref } from "vue";
import AddProgramModal from "~/components/AddProgramModal.vue";
import DotsVerticalIcon from "~/components/icons/DotsVerticalIcon.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import Button from "~/components/ui/Button.vue";
import EmptyState from "~/components/ui/EmptyState.vue";
import FormInput from "~/components/ui/FormInput.vue";
import ToastContainer from "~/components/ui/ToastContainer.vue";
import { formatPrograms } from "~/helper/formatData";
import type { ProgramOutput } from "~/types/program";

interface Program {
  id: number;
  name: string;
  enrolledStudents: number;
  courses: number;
  coreCount: number;
  type: string;
  credits: number;
}
const programs = ref<Program[]>([]);
const {
  call: fetchPrograms,
  isLoading: loading,
  data: programsData,
} = useBackendService("/programs", "get");

const loadPrograms = async () => {
  try {
    await fetchPrograms();
    programs.value = formatPrograms(programsData.value) || [];
  } catch (err) {
    console.error("Failed to fetch programs:", err);
    programs.value = [];
  }
};

// Load data on component mount
onMounted(async () => {
  await loadPrograms();
});

// Filter type
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

// Table state
const globalFilter = ref("");
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

// Modal state
const showAddProgramModal = ref(false);

// Methods
const openAddProgramModal = () => {
  showAddProgramModal.value = true;
};

const handleProgramAdded = (programOutput: ProgramOutput) => {
  const newProgram: Program = {
    ...programOutput,
    enrolledStudents: 0, // Default value
    courses: 0, // Default value
    coreCount: 0, // Default value
  };

  programs.value.push(newProgram);
  showAddProgramModal.value = false;
};

const viewProgramDetails = (programId: number) => {
  return navigateTo(`/admin/programs/${programId}`);
};

// Define that this page uses the dashboard layout
definePageMeta({
  layout: "dashboard",
  // middleware: ["auth"],
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
}
</style>
