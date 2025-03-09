<template>
  <div class="programs-page dashlet-wrapper">
    <div class="page-header dashlet">
      <div class="title-and-filter">
        <h1>Programs</h1>
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
            placeholder="Find a program"
            v-model="searchQuery"
          />
          <SearchIcon class="search-icon" />
        </div>
        <Button @click="openAddProgramModal">
          <template #icon>
            <PlusIcon />
          </template>
          New Program
        </Button>
      </div>
    </div>

    <!-- Empty state for when no programs exist -->
    <EmptyState
      v-if="!programs.length"
      title="No programs found"
      description="Add your first program to get started"
    >
      <template #icon>
        <DocumentIcon />
      </template>
      <template #action>
        <Button @click="openAddProgramModal">
          <template #icon>
            <PlusIcon />
          </template>
          Add a program
        </Button>
      </template>
    </EmptyState>

    <!-- Programs table when programs exist -->
    <div v-else class="programs-content dashlet">
      <table>
        <thead>
          <tr>
            <th
              v-for="header in table.getHeaderGroups()[0].headers"
              :key="header.id"
              @click="header.column.getToggleSortingHandler()"
            >
              {{ header.column.columnDef.header }}
              <span v-if="header.column.getIsSorted()">
                {{ header.column.getIsSortedDesc() ? "▼" : "▲" }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            @click="viewProgramDetails(row.original.id)"
          >
            <td v-for="cell in row.getVisibleCells()" :key="cell.id">
              <component
                :is="cell.column.columnDef.cell"
                :info="cell.getContext()"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button
          @click="table.previousPage()"
          :disabled="!table.getCanPreviousPage()"
        >
          Previous
        </button>
        <span>
          Page
          {{ table.getState().pagination.pageIndex + 1 }} of
          {{ table.getPageCount() }}
        </span>
        <button @click="table.nextPage()" :disabled="!table.getCanNextPage()">
          Next
        </button>
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
import { ref, h, computed } from "vue";
import {
  useVueTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/vue-table";
import type {
  SortingState,
  ColumnDef,
  PaginationState,
  ColumnSort,
} from "@tanstack/vue-table";
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

const columnHelper = createColumnHelper<Program>();

const columns = [
  columnHelper.accessor("name", {
    header: "Program Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("enrolledStudents", {
    header: "Enrolled Students",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("courses", {
    header: "Courses Associated",
    cell: (info) =>
      `${info.getValue()} ${
        info.row.original.coreCount
          ? `+${info.row.original.coreCount} core`
          : ""
      }`,
  }),
  columnHelper.accessor("type", {
    header: "Program Type",
    cell: (info) => {
      const type = info.getValue().toLowerCase();
      return h("span", { class: `program-type ${type}` }, info.getValue());
    },
  }),
  columnHelper.accessor("credits", {
    header: "Credits",
    cell: (info) => info.getValue(),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) =>
      h(
        "button",
        {
          onClick: () => viewProgramDetails(info.row.original.id),
          class: "action-button",
        },
        h(DotsVerticalIcon)
      ),
  }),
];

const searchQuery = ref("");
const sorting = ref<ColumnSort[]>([]);
const pagination = computed(() => ({
  pageIndex: 0,
  pageSize: 10,
}));

const table = useVueTable({
  data: programs,
  columns,
  state: {
    globalFilter: searchQuery,
    sorting: sorting,
    pagination: pagination.value,
  },
  onGlobalFilterChange: (updaterOrValue) => {
    searchQuery.value =
      typeof updaterOrValue === "function"
        ? updaterOrValue(searchQuery.value)
        : updaterOrValue;
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
});

const showAddProgramModal = ref(false);

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
      font-size: $text-2xl;
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

  .programs-content {
    background-color: $white;
    border-radius: 16px;
    border: 1px solid $gray-200;
    overflow: hidden;
  }

  .programs-filter {
    display: flex;
    align-items: center;
    gap: $spacing-4;

    .filter-select {
      padding: $spacing-2 $spacing-4 $spacing-2 $spacing-1;
      border-radius: 8px;
      border: 1px solid $gray-300;
      background-color: $white;
      font-family: $font-family;
      font-size: $text-xs;
      font-weight: 500;
      color: $gray-800;

      &:focus {
        outline: none;
        border-color: $primary-color;
      }
    }
  }

  // Desktop table styles
  .desktop-view {
    width: 100%;
    overflow-x: auto;
    display: block;

    @media (max-width: $breakpoint-md) {
      display: none;
    }
  }

  .programs-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: $spacing-4;
      text-align: left;
      border-bottom: 1px solid $gray-200;
      font-size: $text-sm;
    }

    th {
      color: $gray-700;
      font-weight: 600;
      background-color: $gray-50;
      white-space: nowrap;

      .info-icon {
        width: 16px;
        height: 16px;
        margin-left: $spacing-1;
        vertical-align: middle;
        color: $gray-400;
      }
    }

    tbody tr {
      cursor: pointer;

      &:hover {
        background-color: $primary-color-25;
      }
    }

    .action-column {
      width: 60px;
      text-align: center;
    }

    .action-button {
      background: none;
      border: none;
      cursor: pointer;
      color: $gray-500;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;

      &:hover {
        background-color: $gray-100;
        color: $gray-700;
      }
    }

    .core-tag {
      display: inline-block;
      margin-left: $spacing-2;
      background-color: $primary-color-100;
      color: $primary-color-700;
      padding: 2px $spacing-2;
      border-radius: 4px;
      font-size: $text-xxs;
      font-weight: 500;
    }

    .program-type {
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
  }

  // Mobile card view
  .mobile-view {
    display: none;

    @media (max-width: $breakpoint-md) {
      display: block;
    }
  }

  .program-card {
    padding: $spacing-4;
    border-bottom: 1px solid $gray-200;
    cursor: pointer;

    &:hover {
      background-color: $primary-color-25;
    }

    .program-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-3;

      .program-name {
        font-weight: 600;
        font-size: $text-base;
        color: $gray-800;
        margin: 0;
      }
    }

    .program-card-content {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: $spacing-3;
    }

    .program-stat {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .stat-label {
        font-size: $text-xs;
        color: $gray-500;
      }

      .stat-value {
        font-size: $text-sm;
        color: $gray-800;
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
  }

  // Pagination
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-4;
    border-top: 1px solid $gray-200;

    .pagination-button {
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
    }

    .page-number {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: none;
      background: none;
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
