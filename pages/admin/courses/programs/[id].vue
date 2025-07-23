<template>
  <div class="programs-page dashlet-wrapper">
    <Loader v-if="programsLoad" />

    <div class="page-header dashlet">
      <div class="page-title">
        <button class="back-icon" @click="back">
          <ArrowLeftIcon />
        </button>
        <h2 class="heading-txt">Back</h2>
      </div>
    </div>

    <div class="enrollments-content dashlet program-tabs">
      <div class="tabs-heading">
        <!-- Tabs for students/courses -->
        <div style="display: flex">
          <div class="program-tab">
            <h1>Associated Programs</h1>
          </div>
          <div
            style="margin: auto; margin-left: 20px"
            class="web profile-count pill p-grey pill-sm"
          >
            {{ programs.length }}
          </div>
        </div>

        <div style="display: flex" class="header-actions">
          <div class="web">
            <div class="search-and-actions">
              <div class="search-container">
                <FormInput
                  id="program-search"
                  label=""
                  v-model="searchQuery"
                  :placeholder="
                    activeTab === 'courses'
                      ? 'Search Programs'
                      : 'Search Programs'
                  "
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

          <FilterIcon class="avatar" />
        </div>
      </div>

      <div style="display: flex">
        <MobilePrograms
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          v-bind="row.original"
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
import { useRoute } from "vue-router";
import MobilePrograms from "~/components/courses/MobilePrograms.vue";
import ArrowLeftIcon from "~/components/icons/ArrowLeftIcon.vue";
import FilterIcon from "~/components/icons/FilterIcon.vue";
import FormInput from "~/components/ui/FormInput.vue";

definePageMeta({
  layout: "dashboard",
});
const route = useRoute();
const courseId = route.params.id as string;
const activeTab = ref("students");
const showEditModal = ref(false);

const back = () => {
  navigateTo(`/admin/courses/${courseId}`); // Navigate back to the course list
};
const edit = () => {
  showEditModal.value = true;
};

const programs = ref<any[]>([]);

const {
  call: programCall,
  isLoading: programsLoad,
  data: programData,
} = useBackendService(`/courses/${courseId}/programs`, "get");

onMounted(fetchSession);

async function fetchSession() {
  try {
    await programCall({});
    programs.value = programData.value || [];
  } catch (err) {
    programs.value = [];
  }
}

const filteredData = computed(() => {
  if (activeTab.value === "students") {
    return programs.value;
  }
  return [];
});

const columnHelper = createColumnHelper<any>();

const columns = computed(() => {
  if (activeTab.value === "students") {
    // Student columns
    return [
      columnHelper.accessor("firstName", {
        header: "Student Name",
        cell: (props) => props.getValue(),
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (props) => props.getValue(),
      }),
      columnHelper.accessor("regNumber", {
        header: "Session Taken",
        cell: (props) => props.getValue(),
      }),
    ];
  } else if (activeTab.value === "courses") {
  }

  return [];
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
    return filteredData.value;
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
</script>

<style lang="scss" scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: background-color 0.4s;
  border-radius: 34px;
}

.slider::before {
  content: "";
  position: absolute;
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: transform 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2a50ad;
}

input:checked + .slider::before {
  transform: translateX(22px);
}
.program-detail-page {
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .page-title {
    display: flex;
    align-items: center;
    gap: $spacing-2;
  }

  .back-icon {
    background: none;
    border: none;
    color: $gray-900;
    cursor: pointer;
    width: 20px;
    height: 20px;
  }

  .header-actions {
    display: flex;
    gap: $spacing-4;
  }
}

.dashlet.program-details {
  padding: 0;
  overflow: hidden;
}

.program-overview {
  padding: $spacing-8;
  display: flex;
  flex-direction: column;
  gap: $spacing-6;
  border-bottom: 1px solid $gray-200;

  .overview-stats {
    display: flex;
    justify-content: space-between;
    gap: $spacing-6;
  }

  .stat-card {
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: space-around;

    .stat-value {
      font-size: $text-3xl;
      font-weight: 700;
      color: $gray-900;
    }

    .stat-details {
      display: flex;
      align-items: center;
      gap: $spacing-1;
    }

    .stat-label {
      font-size: $text-sm;
      color: $gray-600;
    }

    .core-count {
      display: inline-block;
      padding: 2px $spacing-2;
      border-radius: 4px;
      font-size: $text-xs;
      font-weight: 500;
      background-color: $primary-color-100;
      color: $primary-color-700;
    }
  }
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px 1px 6px;
  border-radius: 16px;
  font-size: $text-sm;
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
  background-color: $warning-50;
  color: $warning-500;
  border: 1px solid $warning-500;

  .status-dot {
    background-color: $warning-500;
  }
}
.status-blue {
  background-color: $primary-color-50;
  color: $primary-color-500;
  border: 1px solid $primary-color-500;

  .status-dot {
    background-color: $primary-color-500;
  }
}

.status-deactivated {
  background-color: $gray-50;
  color: $gray-700;
  border: 1px solid $gray-200;

  .status-dot {
    background-color: $gray-400;
  }
}
.inlineborder {
  width: max-content;
  padding: 10px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
}
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
/* Container */
</style>
