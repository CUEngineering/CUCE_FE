<template>
  <div class="programs-page dashlet-wrapper">
    <div class="page-header dashlet">
      <div class="title-and-filter">
        <h1>Programmes</h1>
        <div v-if="programs.length > 0" class="programs-filter">
          <select v-model="filterType" class="filter-select">
            <option value="all">All ({{ programs.length }})</option>
          </select>
        </div>
      </div>
      <div v-if="programs.length > 0" class="search-and-actions">
        <div class="search-container">
          <input
            type="text"
            class="search-input"
            placeholder="Find a programme"
            v-model="searchQuery"
          />
          <SearchIcon class="search-icon" />
        </div>
        <Button @click="openAddProgramModal" variant="primary">
          <template #icon>
            <PlusIcon />
          </template>
          New Programme
        </Button>
      </div>
    </div>

    <!-- Empty state for when no programs exist -->
    <EmptyState
      v-if="!programs.length"
      title="No programmes found"
      description="Add your first programme to get started"
    >
      <template #icon>
        <DocumentIcon />
      </template>
      <template #action>
        <Button @click="openAddProgramModal">
          <template #icon>
            <PlusIcon />
          </template>
          Add a programme
        </Button>
      </template>
    </EmptyState>

    <!-- Programs table when programs exist -->
    <div v-else class="programs-content dashlet">
      <table class="programs-table">
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
                  {{ header.column.getIsSortedDesc() ? "▼" : "▲" }}
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
                    :class="['program-type', row.original.type.toLowerCase()]"
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
import { ref, reactive, computed, h } from "vue";
import {
  createColumnHelper,
  FlexRender,
  useVueTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/vue-table";
import type { ColumnSort } from "@tanstack/vue-table";
import Button from "~/components/ui/Button.vue";
import EmptyState from "~/components/ui/EmptyState.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import SearchIcon from "~/components/icons/SearchIcon.vue";
import DocumentIcon from "~/components/icons/DocumentIcon.vue";
import DotsVerticalIcon from "~/components/icons/DotsVerticalIcon.vue";
import AddProgramModal from "~/components/AddProgramModal.vue";
import ToastContainer from "~/components/ui/ToastContainer.vue";

interface Program {
  id: number;
  name: string;
  enrolledStudents: number;
  courses: number;
  coreCount: number;
  type: string;
  credits: number;
}

// Mock data - replace with API call in production
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

// programs.value = [];

// Filter type
const filterType = ref("all");

const columnHelper = createColumnHelper<Program>();

const columns = [
  columnHelper.accessor("name", {
    header: "Programme Name",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("enrolledStudents", {
    header: "Enrolled Students",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("courses", {
    header: "Courses associated",
    cell: (props) => {
      const coreCount = props.row.original.coreCount;
      return `${props.getValue()} ${coreCount ? `+${coreCount} core` : ""}`;
    },
  }),
  columnHelper.accessor("type", {
    header: "Programme Type",
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

const handleProgramAdded = (newProgram: Program) => {
  programs.value.push(newProgram);
  showAddProgramModal.value = false;
};

const viewProgramDetails = (programId: number) => {
  return navigateTo(`/programs/${programId}`);
};

// Define that this page uses the dashboard layout
definePageMeta({
  layout: "dashboard",
});
</script>

<style lang="scss" scoped>
.programs-page {
  max-width: 100%;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: $spacing-4;

    h1 {
      font-family: $font-family-heading;
      font-size: $text-xl;
      font-weight: 700;
      color: $gray-900;
      margin: 0;
    }

    .title-and-filter {
      display: flex;
      align-items: center;
      gap: $spacing-4;
    }

    .search-and-actions {
      display: flex;
      gap: $spacing-2;
    }

    .search-container {
      position: relative;

      .search-input {
        padding: $spacing-3 $spacing-3 $spacing-3 $spacing-10;
        border-radius: 12px;
        border: 1px solid $gray-300;
        background-color: $white;
        font-family: $font-family;
        font-size: $text-sm;
        width: 250px;

        &:focus {
          outline: none;
          border-color: $primary-color;
          box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
        }
      }

      .search-icon {
        position: absolute;
        left: $spacing-3;
        top: 50%;
        transform: translateY(-50%);
        color: $gray-500;
        width: 20px;
        height: 20px;
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
    width: 100%;
    border-collapse: collapse;

    .table-header {
      padding: $spacing-4;
      text-align: left;
      color: $gray-700;
      font-weight: 600;
      font-size: $text-sm;
      background-color: $gray-50;
      border-bottom: 1px solid $gray-200;
      position: relative;
      cursor: pointer;

      .header-content {
        display: flex;
        align-items: center;
        gap: $spacing-2;
      }

      .sort-indicator {
        display: inline-block;
        color: $primary-color;
        font-size: $text-sm;
      }

      &:last-child {
        text-align: center;
      }
    }

    .table-row {
      cursor: pointer;
      transition: background-color 0.15s ease;

      &:nth-child(even) {
        background-color: $gray-50;
      }

      &:hover {
        background-color: $primary-color-25;
      }
    }

    .table-cell {
      padding: $spacing-4;
      text-align: left;
      border-bottom: 1px solid $gray-200;
      font-size: $text-sm;
      color: $gray-800;

      &:last-child {
        text-align: center;
      }
    }

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

    .program-type {
      display: inline-block;
      padding: 4px $spacing-3;
      border-radius: 16px;
      font-size: $text-xs;
      font-weight: 500;

      &.undergraduate {
        background-color: $primary-color-50;
        color: $primary-color-700;
      }

      &.masters {
        background-color: $secondary-color;
        color: $white;
      }

      &.doctorate {
        background-color: $warning-300;
        color: $gray-800;
      }
    }

    .action-button {
      background: none;
      border: none;
      cursor: pointer;
      color: $gray-500;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      margin: 0 auto;

      &:hover {
        background-color: $gray-100;
        color: $gray-700;
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

  .action-cell {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
