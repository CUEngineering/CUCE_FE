<template>
  <div class="programs-page dashlet-wrapper">
    <div class="page-header dashlet">
      <div class="page-title">
        <button class="back-icon" @click="back">
          <ArrowLeftIcon />
        </button>
        <h2 class="heading-txt">Course Details</h2>
      </div>
    </div>
    <Loader v-if="loading" />

    <div v-if="!loading" class="dashlet program-details">
      <div class="program-overview">
        <div style="display: flex">
          <h1 class="program-title">{{ sessions?.course_title }}</h1>
          <IconsEditIcon
            @click="edit"
            style="margin-top: 5px; margin-left: 5px; cursor: pointer"
          />
        </div>

        <div class="overview-stats">
          <div class="stat-card">
            <div class="stat-label">Course Type</div>
            <div class="stat-details">
              <div
                class="status-badge"
                :class="getStatusClass(sessions?.course_type || '')"
              >
                {{ capitalizeFirst(sessions?.course_type || "") }}
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Associated Programmes</div>
            <div class="stat-details">
              <div
                style="padding: 5px 15px; text-align: center; margin-left: 10px"
                class="profile-count pill p-grey"
              >
                {{ programs?.length || 0 }}
              </div>
              <div
                @click="$router.push(`/admin/courses/programs/${courseId}`)"
                style="
                  border-radius: 10px;
                  padding: 5px 15px;
                  text-align: center;
                  margin-left: 10px;
                  color: #3d86f4;
                  cursor: pointer;
                "
                class="profile-count status-blue"
              >
                View all <RightBlueArrow />
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">No of Sessions</div>
            <div
              style="padding: 5px 15px; text-align: center; margin-left: 10px"
              class="profile-count pill p-grey"
            >
              {{ sessionsCount?.length || 0 }}
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Enrolled Students</div>

            <div class="stat-details">
              <div
                style="padding: 5px 15px; text-align: center; margin-left: 10px"
                class="profile-count pill p-grey"
              >
                {{ students?.length || 0 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading" class="enrollments-content dashlet program-tabs">
      <div class="tabs-heading">
        <!-- Tabs for students/courses -->
        <div style="display: flex">
          <div class="program-tab">
            <h1>Students</h1>
          </div>
          <div
            style="margin: auto; margin-left: 20px"
            class="web profile-count pill p-grey pill-sm"
          >
            ({{ startRecord }} - {{ endRecord }}) of {{ totalRecords }}
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
                      ? 'Search Courses'
                      : 'Search Students'
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
                  ></div>

                  <div
                    v-else-if="cell.column.id === 'firstName'"
                    class="student-info"
                  >
                    <img
                      :src="cell.row.original.student.profile_picture"
                      alt="Image"
                      class="avatar"
                    />
                    <div class="student-details">
                      <div class="student-name">
                        {{ cell.row.original.student.first_name }}{{ " " }}
                        {{ cell.row.original.student.last_name }}
                      </div>
                    </div>
                  </div>
                  <div
                    v-else-if="cell.column.id === 'email'"
                    class="student-info"
                  >
                    <div class="student-details">
                      <div class="student-name">
                        {{ cell.row.original.student.email }}
                      </div>
                    </div>
                  </div>
                  <div
                    v-else-if="cell.column.id === 'email'"
                    class="student-info"
                  >
                    <div class="student-details">
                      <div class="student-name">
                        {{ cell.row.original.student.email }}
                      </div>
                    </div>
                  </div>
                  <div
                    v-else-if="cell.column.id === 'regNumber'"
                    class="student-info"
                  >
                    <div class="student-details">
                      <div class="student-name">
                        <div
                          style="
                            padding: 5px 15px;
                            text-align: center;
                            margin-left: 10px;
                          "
                          class="profile-count pill p-grey"
                        >
                          {{ cell.row.original.session.session_name || "" }}
                        </div>
                      </div>
                    </div>
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
        <div v-if="activeTab === 'students'">
          <MobileCourses
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            v-bind="row.original"
          />
        </div>
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
    <AddCourseModal
      v-model="showEditModal"
      mode="edit"
      :program="selectedProgram"
      @program-updated="handlerealTime"
      @program-added="handlerealTime"
      @courses-added="handlerealTime"
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
import { useRoute } from "vue-router";
import MobileCourses from "~/components/courses/MobileCourses.vue";
import ArrowLeftIcon from "~/components/icons/ArrowLeftIcon.vue";
import FilterIcon from "~/components/icons/FilterIcon.vue";
import RightBlueArrow from "~/components/icons/RightBlueArrow.vue";
import FormInput from "~/components/ui/FormInput.vue";
import { capitalizeFirst, getStatusClass } from "~/helper/formatData";

definePageMeta({
  layout: "dashboard",
});
const route = useRoute();
const courseId = parseInt(route.params.id as string);
const activeTab = ref("students");
const showEditModal = ref(false);
const selectedProgram = ref<any | null>(null);

const back = () => {
  navigateTo("/admin/courses");
};
const edit = () => {
  selectedProgram.value = sessions;
  showEditModal.value = true;
};

const toast = useToast();

let sessions = ref<any>(null);
const students = ref<any[]>([]);
const courses = ref<any[]>([]);
const programs = ref<any[]>([]);
const sessionsCount = ref<any[]>([]);

const { call, data: single } = useBackendService(`/courses/${courseId}`, "get");
const { call: studentCall, data: studentData } = useBackendService(
  `/courses/${courseId}/students`,
  "get"
);
const { call: programCall, data: programData } = useBackendService(
  `/courses/${courseId}/programs`,
  "get"
);
const { call: sessionsCall, data: sessionData } = useBackendService(
  `/courses/${courseId}/sessions`,
  "get"
);

const loading = ref(false);

const coursesDataCache = useState<any | null>("courseCacheData", () => null);
const programDetailsDataCache = useState<any | null>(
  "programDetailsDataCache",
  () => null
);
const idCache = useState<any>("idCourse", () => null);
const studentsDataCache = useState<any | null>("studentLoad", () => null);
const sessionsDataCache = useState<any | null>("sessionLoad", () => null);

onMounted(async () => {
  if (
    !coursesDataCache.value &&
    !programDetailsDataCache.value &&
    !studentsDataCache.value &&
    !sessionsDataCache.value
  ) {
    try {
      loading.value = true;
      idCache.value = courseId;
      await fetchData();
      loading.value = false;
    } catch (err) {
      console.error("Failed to fetch", err);
    }
  }

  if (
    coursesDataCache.value ||
    programDetailsDataCache.value ||
    studentsDataCache.value ||
    sessionsDataCache.value
  ) {
    sessions.value = sessionsDataCache.value;
    students.value = studentsDataCache.value || [];
    programs.value = programDetailsDataCache.value || [];
    sessionsCount.value = coursesDataCache.value || [];
  }
  if (parseInt(idCache.value) !== courseId || !idCache.value) {
    idCache.value = courseId;
    loading.value = true;
    await fetchData();
    loading.value = false;
  }
});

async function fetchData() {
  try {
    await call({});
    sessionsDataCache.value = single.value;
    sessions.value = single.value || null;
  } catch (err) {
    sessions.value = null;
  }

  try {
    await studentCall({});
    studentsDataCache.value = studentData.value;
    students.value = studentData.value || [];
  } catch (err) {
    students.value = [];
  }

  try {
    await programCall({});
    programDetailsDataCache.value = programData.value;
    programs.value = programData.value || [];
  } catch (err) {
    programs.value = [];
  }

  try {
    await sessionsCall({});
    coursesDataCache.value = sessionData.value;
    sessionsCount.value = sessionData.value || [];
  } catch (err) {
    sessionsCount.value = [];
  }
}
const handlerealTime = async () => {
  await fetchData();
};

const filteredData = computed(() => {
  if (activeTab.value === "students") {
    return students.value;
  } else if (activeTab.value === "courses") {
    return courses.value;
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

const totalRecords = computed(() => filteredData.value.length);

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
