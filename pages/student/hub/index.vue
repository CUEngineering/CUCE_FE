<template>
  <ClientOnly>
    <div
      class="student-hub-page dashlet-wrapper"
      :class="{ empty: !courses.length }"
    >
      <div class="page-header dashlet">
        <div class="title-and-filter">
          <h2 class="heading-txt">Courses</h2>
          <div
            style="margin: auto"
            class="web profile-count pill p-grey pill-sm"
          >
            {{ courses.length }}
          </div>
        </div>
        <div class="search-and-actions">
          <div class="search-container">
            <UiFormInput
              id="program-search"
              v-model="searchQuery"
              label=""
              placeholder="Find Course"
              size="sm"
            >
              <template #button>
                <div class="search-icon">
                  <IconsSearchIcon />
                </div>
              </template>
            </UiFormInput>
          </div>
          <div class="tabs-heading">
            <div class="web header-actions">
              <UiFormSelect
                id="session-filter"
                v-model="selectedSessionId"
                label=""
                placeholder="Select Session"
                type="string"
                :options="sessionFilterList"
                required
              />
            </div>
          </div>
        </div>
      </div>
      <Loader v-if="loading" />

      <!-- Empty state for when no student course exist -->
      <UiEmptyState
        v-if="!loading && !courses.length"
        class="dashlet"
        title="My Hub"
        description="TYou are not enrolled in any courses for this session. Please go to courses to make a request"
      >
        <template #icon>
          <img
            src="~/assets/images/global-education3.svg"
            alt="Users Illustration"
            class="empty-state-illustration"
          />
        </template>
        <template #action>
          <UiButton
            variant="outline"
            size="sm"
            @click="
              navigateTo({
                name: 'student-courses',
              })
            "
          >
            <template #icon>
              <IconsEyeIcon />
            </template>
            Request Courses
          </UiButton>
        </template>
      </UiEmptyState>

      <!-- Courses table when courses exist -->
      <div
        v-else-if="courses.length > 0 && !loading"
        class="student-hub-content dashlet"
      >
        <table class="web-table student-hub-table table-container">
          <thead>
            <tr>
              <th
                v-for="header in table.getHeaderGroups()[0].headers"
                :key="header.id"
                class="table-header"
                @click="header.column.getToggleSortingHandler()"
              >
                <div class="header-content">
                  {{ header.column.columnDef.header }}
                  <span
                    v-if="header.column.getIsSorted()"
                    class="sort-indicator"
                  >
                    {{
                      header.column.getIsSorted() === 'desc'
                        ? '▼'
                        : '▲'
                    }}
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
              @click="viewCourseDetails(row.original)"
            >
              <td
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="table-cell"
              >
                <template
                  v-if="
                    typeof cell.column.columnDef.cell === 'function'
                  "
                >
                  <div
                    v-if="cell.column.id === 'actions'"
                    class="action-cell"
                    @click.stop
                  >
                    <div>
                      <UiButton
                        variant="primary"
                        @click="viewCourseDetails(row.original)"
                      >
                        View
                      </UiButton>
                    </div>
                  </div>

                  <div
                    v-else-if="cell.column.id === 'course_type'"
                    class="program-type-cell"
                  >
                    <span
                      class="pill pill-md"
                      :class="
                        row.original.course_type.toLowerCase() ===
                        'undergraduate'
                          ? 'p-green'
                          : row.original.course_type.toLowerCase() ===
                              'doctorate'
                            ? 'p-yellow'
                            : 'p-blue'
                      "
                    >
                      {{
                        capitalizeFirst(
                          row.original.course_type.toLowerCase(),
                        )
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
                    v-else-if="cell.column.id === 'in_active_session'"
                    class="courses-cell profile-count pill p-grey pill-lg"
                    style="width: fit-content"
                  >
                    {{
                      row.original.in_active_session ? 'YES' : 'NO'
                    }}
                  </div>
                  <div
                    v-else-if="
                      cell.column.id === 'availability_status'
                    "
                    class="status-badge"
                    :class="
                      getStatusClass(String(cell.renderValue() ?? ''))
                    "
                  >
                    <span class="status-dot"></span>
                    {{
                      capitalizeFirst(
                        String(cell.renderValue() ?? ''),
                      )
                    }}
                  </div>
                  <div
                    v-else-if="
                      cell.column.id === 'student_course_enrollements'
                    "
                    class="enrollments-wrapper"
                  >
                    <ul class="list">
                      <li
                        v-for="(enrollment, index) of row.original
                          .student_course_enrollements"
                        :key="index"
                        :class="[
                          `item`,
                          getStatusClass(
                            enrollment.enrollment_status,
                          ),
                        ]"
                      >
                        <span class="date">
                          {{
                            formatDateToDateAndTime(
                              enrollment.updated_at,
                            )
                          }}
                        </span>
                        &nbsp;
                        <span class="text">
                          <template
                            v-if="
                              enrollment.enrollment_status ===
                              'PENDING'
                            "
                          >
                            pending
                          </template>
                          <template
                            v-else-if="
                              enrollment.enrollment_status ===
                              'REJECTED'
                            "
                          >
                            {{ enrollment.rejection_reason }}
                          </template>
                          <template v-else> Enrolled </template>
                        </span>
                      </li>
                    </ul>
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
            :selected-course="row.original"
            @viewDetails="
              viewCourseDetails(row.original.course_id as any)
            "
          />
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <div class="pagination-controls">
            <button
              :disabled="!table.getCanPreviousPage()"
              class="pagination-button"
              @click="table.previousPage()"
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
                class="page-button"
                :class="{
                  active:
                    table.getState().pagination.pageIndex ===
                    page - 1,
                }"
                @click="goToPage(page - 1)"
              >
                {{ page }}
              </button>
            </div>
            <button
              :disabled="!table.getCanNextPage()"
              class="pagination-button"
              @click="table.nextPage()"
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

      <StudentDetailsStudent
        v-if="showInfoModal && selectedCourse"
        v-model="showInfoModal"
        :course="selectedCourse"
        @close="showInfoModal = false"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { TableState } from '@tanstack/vue-table';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table';
import { isFunction, orderBy } from 'lodash-es';
import { computed, reactive, ref } from 'vue';
import {
  capitalizeFirst,
  formatDateToDateAndTime,
  getStatusClass,
} from '~/helper/formatData';
import type { StudentCourseListType } from '~/types/course';

definePageMeta({
  layout: 'student',
});

const authStore = useAuthStore();
const studentStore = useStudentStore();

const studentId = computed(() =>
  String(authStore.user?.student_id ?? ''),
);

watch(
  studentId,
  (studentId) => {
    if (studentId) {
      if (String(studentStore.selectedStudentId) !== studentId) {
        studentStore.studentSessionCoursesResp.clear();
      }

      studentStore.selectedStudentId = studentId;
    }
  },
  {
    immediate: true,
  },
);

// const toast = useToast();
const sessionFilter = useSessionsFilter();
const sessionFilterList = computed(() =>
  (sessionFilter.data.value ?? []).map((s) => ({
    value: String(s.session_id),
    label: s.session_name,
  })),
);

const selectedSessionId = computed({
  get() {
    return studentStore.selectedStudentSessionId;
  },
  set(val: string) {
    if (
      String(val) !== String(studentStore.selectedStudentSessionId)
    ) {
      studentStore.studentSessionCoursesResp.clear();
    }

    studentStore.selectedStudentSessionId = val;
  },
});

watch(sessionFilter.data, (list) => {
  const selectedSession = orderBy(
    list ?? [],
    [
      (s) => (s.session_status === 'ACTIVE' ? 1 : 0),
      (s) => new Date(s.created_at).getTime(),
    ],
    ['desc', 'asc'],
  )[0];

  if (selectedSession) {
    selectedSessionId.value = String(selectedSession.session_id);
  }
});

const loading = computed(
  () =>
    !studentStore.studentSessionCoursesResp.data.value?.length &&
    studentStore.studentSessionCoursesResp.status.value === 'pending',
);

const courses = computed(() => {
  const list =
    studentStore.studentSessionCoursesResp.data.value || [];
  return list;
});

onMounted(() => {
  studentStore.studentSessionCoursesResp.refresh({
    dedupe: 'cancel',
  });
});

const columnHelper = createColumnHelper<StudentCourseListType>();

const columns = computed(() => {
  const cols = [
    columnHelper.accessor('course_title', {
      header: 'Course Title',
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor('course_code', {
      header: 'Course Code',
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor('course_type', {
      header: 'Course Type',
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor('course_credits', {
      header: 'Credits Value',
      cell: (props) => props.getValue() || 0,
    }),
    columnHelper.accessor('in_active_session', {
      header: 'Is In Session',
      enableHiding: true,
      cell: (props) => props.getValue() || 0,
    }),
    columnHelper.accessor('availability_status', {
      header: 'Course Status',
      cell: (props) => props.getValue() || 0,
    }),
    columnHelper.accessor('student_course_enrollements', {
      header: 'Enrollments',
      enableHiding: true,
      cell: (props) => props.getValue() || 0,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Action',
      cell: () => {},
    }),
  ];

  return cols;
});

const tableState = reactive<
  Pick<
    TableState,
    'pagination' | 'sorting' | 'globalFilter' | 'columnVisibility'
  >
>({
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  sorting: [],
  globalFilter: '',
  columnVisibility: {
    course_title: true,
    course_code: true,
    course_type: true,
    course_credits: true,
    in_active_session: true,
    availability_status: true,
    student_course_enrollements: true,
  },
});

const searchQuery = computed({
  get: () => tableState.globalFilter,
  set: (value) => {
    tableState.globalFilter = value;
  },
});

const table = useVueTable({
  get data() {
    return courses.value;
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
      typeof updater === 'function'
        ? updater(tableState.sorting)
        : updater;
    tableState.sorting = newValue;
  },
  onPaginationChange: (updater) => {
    const newValue =
      typeof updater === 'function'
        ? updater(tableState.pagination)
        : updater;
    tableState.pagination = newValue;
  },
  onColumnVisibilityChange: async (state) => {
    const newVisibilityState = isFunction(state)
      ? await state(tableState.columnVisibility)
      : state;
    tableState.columnVisibility = newVisibilityState;
    return tableState.columnVisibility;
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

  let startPage = Math.max(
    currentPage - Math.floor(maxVisiblePages / 2),
    1,
  );
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxVisiblePages + 1, 1);
  }

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );
};

const selectedCourse = ref<StudentCourseListType | null>(null);
const showInfoModal = ref(false);

const viewCourseDetails = async (rowData: StudentCourseListType) => {
  selectedCourse.value = rowData;
  showInfoModal.value = true;
};

const goToPage = (pageIndex: number) => {
  table.setPageIndex(pageIndex);
};
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

.student-hub-page {
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

      > * {
        display: inline-flex;
        align-items: center;
      }

      :deep(.base-button) {
        width: unset;
      }

      #session-filter {
        gap: initial;
      }
    }
  }

  // Table styles
  .student-hub-content {
    background-color: $white;
    border-radius: 16px;
    border: 1px solid $gray-200;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    &.dashlet {
      padding: 0;
    }
  }

  .student-hub-table {
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
