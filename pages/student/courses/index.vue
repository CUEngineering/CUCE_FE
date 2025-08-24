<template>
  <ClientOnly>
    <div
      class="programs-page dashlet-wrapper"
      :class="{ empty: !courses.length }"
    >
      <div class="tabs-wrapper">
        <!-- Tabs for students/courses -->
        <div class="title">
          <button
            class="button"
            :class="{ active: activeTab === 'session' }"
            @click="activeTab = 'session'"
          >
            This Session
          </button>
          <button
            class="button"
            :class="{ active: activeTab === 'program' }"
            @click="activeTab = 'program'"
          >
            All Courses
          </button>
        </div>
      </div>
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
        <div
          v-if="courses.length > 0"
          class="search-and-actions"
        >
          <div class="search-container">
            <FormInput
              id="program-search"
              v-model="searchQuery"
              label=""
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
        v-else-if="!courses.length"
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

      <!-- Courses table when courses exist -->
      <div
        v-else-if="courses.length > 0 && !loading"
        class="programs-content dashlet"
      >
        <table class="web-table programs-table table-container">
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
                    <template
                      v-if="
                        row.original.can_enroll ||
                        row.original.can_request
                      "
                    >
                      <!-- Enroll button if course is open -->
                      <div v-if="row.original.can_enroll">
                        <Button
                          variant="secondary"
                          @click="enroll(row.original)"
                        >
                          Enroll
                        </Button>
                      </div>

                      <div v-else>
                        <Button
                          variant="yellow"
                          @click="request(row.original)"
                        >
                          Request
                        </Button>
                      </div>
                    </template>
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
                          {{ formatDate(enrollment.updated_at) }}
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

      <!-- Toast Container -->
      <ToastContainer />
      <Dialog
        v-model="showEnrollModal"
        title="Enroll"
        :message="`Are you sure you want to enroll in ${selectedCourse?.course_code} this session? Click 'Yes' to continue`"
        variant="warning"
        :loading="isActionLoading"
        confirm-button-text="Yes, Enroll"
        cancel-button-text="No, cancel"
        @confirm="handleEnrollAction"
      />
      <Dialog
        v-model="showRequestModal"
        title="Submit a request"
        :message="`This class (${selectedCourse?.course_code}) is <strong>currently closed</strong> for this session. Please Confirm your request to be added to the class`"
        variant="warning"
        :loading="isActionLoading"
        confirm-button-text="Submit Request"
        cancel-button-text="Cancel"
        @confirm="handleRequestAction"
      />

      <Dialog
        v-model="showSuccessDialog"
        title="Request Sent"
        :message="`Your request to be added to ${selectedCourse?.course_code} has successfully been sent.`"
        variant="success"
        :icon="true"
        cancel-button-text="Awesome 🎉"
        confirm-button-text=""
        :show-cancel-button="true"
        :show-confirm-button="false"
        :show-close-button="true"
        :persistent="false"
        :loading="false"
      />
      <Dialog
        v-model="showFailureDialog"
        title="Something’s Wrong!"
        message="There was an issue, your request didn’t go through, Please try again."
        variant="danger"
        :icon="true"
        cancel-button-text="Try again!"
        confirm-button-text=""
        :show-cancel-button="true"
        :show-confirm-button="false"
        :show-close-button="true"
        :persistent="false"
        :loading="false"
      />
      <StudentDetailsStudent
        v-if="showInfoModal && selectedCourse"
        v-model="showInfoModal"
        :loading="isActionLoading"
        :course="selectedCourse"
        @enroll="showEnrollModal = true"
        @request="showRequestModal = true"
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
import { computed, h, reactive, ref } from 'vue';
import DotsVerticalIcon from '~/components/icons/DotsVerticalIcon.vue';
import Button from '~/components/ui/Button.vue';
import Dialog from '~/components/ui/Dialog.vue';
import EmptyState from '~/components/ui/EmptyState.vue';
import FormInput from '~/components/ui/FormInput.vue';
import ToastContainer from '~/components/ui/ToastContainer.vue';
import {
  capitalizeFirst,
  formatDate,
  getStatusClass,
} from '~/helper/formatData';
import { useStudentStore } from '~/stores/student';
import type { StudentCourseListType } from '~/types/course';

const authState = useAuthStore();
const studentStore = useStudentStore();

const activeTab = ref<'program' | 'session'>('session');

const isFetchingCoursesInSession = computed(
  () =>
    studentStore.coursesInCurrentSessionResp.status.value ===
    'pending',
);

const coursesInSession = computed(
  () => studentStore.coursesInCurrentSessionResp.data.value,
);

const isFetchingCoursesInProgram = computed(
  () => studentStore.coursesInProgramResp.status.value === 'pending',
);

const coursesInProgram = computed(
  () => studentStore.coursesInProgramResp.data.value,
);

// watch(activeTab, (tab) => {
//   switch (tab) {
//     case 'session': {
//       studentStore.coursesInCurrentSessionResp.refresh({
//         dedupe: 'cancel',
//       });

//       break;
//     }

//     case 'program': {
//       studentStore.coursesInProgramResp.refresh({
//         dedupe: 'cancel',
//       });

//       break;
//     }
//   }
// });

const loading = ref(false);

const courses = computed(() => {
  let list: StudentCourseListType[] = [];
  switch (activeTab.value) {
    case 'session': {
      list = coursesInSession.value;
      break;
    }

    case 'program': {
      list = coursesInProgram.value;
      break;
    }

    default: {
      list = [];
      break;
    }
  }

  list.forEach((course) => {
    course.student_course_enrollements = orderBy(
      course.student_course_enrollements,
      [
        (e) => new Date(e.updated_at).getTime(),
        (e) => new Date(e.created_at).getTime(),
      ],
      ['desc', 'desc'],
    );
  });

  return list;
});

watch(
  [isFetchingCoursesInSession, isFetchingCoursesInProgram],
  (curr) => {
    loading.value =
      curr.some((val) => !!val) && !courses.value.length;
  },
  {
    immediate: true,
  },
);

const columnHelper = createColumnHelper<StudentCourseListType>();

const columns = computed(() => {
  return [
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
      cell: (props) => {
        return h(
          'button',
          {
            onClick: (e) => {
              e.stopPropagation();
            },
            class: 'action-button',
          },
          h(DotsVerticalIcon),
        );
      },
    }),
  ];
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

watch(
  activeTab,
  (tab) => {
    table.setColumnVisibility((visibilityState) => {
      return {
        ...visibilityState,
        in_active_session: tab === 'program',
      };
    });

    if (tab === 'program') {
      studentStore.coursesInProgramResp.refresh({ dedupe: 'cancel' });
    } else {
      studentStore.coursesInCurrentSessionResp.refresh({
        dedupe: 'cancel',
      });
    }
  },
  {
    immediate: true,
  },
);

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

const goToPage = (pageIndex: number) => {
  table.setPageIndex(pageIndex);
};

const selectedCourse = ref<StudentCourseListType | null>(null);
const showEnrollModal = ref(false);
const showRequestModal = ref(false);
const showInfoModal = ref(false);
const isActionLoading = ref(false);
const showSuccessDialog = ref(false);
const showFailureDialog = ref(false);

const enroll = async (rowData: StudentCourseListType) => {
  selectedCourse.value = rowData;
  showEnrollModal.value = true;
};
const request = async (rowData: StudentCourseListType) => {
  selectedCourse.value = rowData;
  showRequestModal.value = true;
};
const viewCourseDetails = async (rowData: StudentCourseListType) => {
  selectedCourse.value = rowData;
  showInfoModal.value = true;
};
const handleEnrollAction = async () => {
  const { call } = useBackendService(`/enrollments`, 'post');

  isActionLoading.value = true;
  try {
    await call({
      student_id: authState.user?.student_id,
      course_id: selectedCourse.value?.course_id,
      session_id: parseInt(
        selectedCourse.value?.active_session_ids[0] ?? '0',
        10,
      ),
      enrollment_status: 'PENDING',
    });

    switch (activeTab.value) {
      case 'program': {
        await studentStore.coursesInProgramResp.refresh({
          dedupe: 'cancel',
        });
        break;
      }

      case 'session': {
        await studentStore.coursesInCurrentSessionResp.refresh({
          dedupe: 'cancel',
        });
        break;
      }
    }

    showSuccessDialog.value = true;
    showEnrollModal.value = false;
    showRequestModal.value = false;
  } catch (error) {
    showFailureDialog.value = true;
  } finally {
    isActionLoading.value = false;
  }
};

const handleRequestAction = async () => {
  const { call } = useBackendService(`/enrollments`, 'post');

  isActionLoading.value = true;
  try {
    await call({
      student_id: authState.user?.student_id,
      course_id: selectedCourse.value?.course_id,
      session_id: parseInt(
        selectedCourse.value?.active_session_ids[0] ?? '0',
        10,
      ),
      enrollment_status: 'PENDING',
    });

    switch (activeTab.value) {
      case 'program': {
        await studentStore.coursesInProgramResp.refresh({
          dedupe: 'cancel',
        });
        break;
      }

      case 'session': {
        await studentStore.coursesInCurrentSessionResp.refresh({
          dedupe: 'cancel',
        });
        break;
      }
    }

    showSuccessDialog.value = true;
    showEnrollModal.value = false;
    showRequestModal.value = false;
  } catch (error) {
    showFailureDialog.value = true;
  } finally {
    isActionLoading.value = false;
  }
};

// Define that this page uses the dashboard layout
definePageMeta({
  layout: 'student',
});
</script>

<style lang="scss" scoped>
.programs-page {
  max-width: 100%;

  &.empty {
    height: 100%;
  }

  > .tabs-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-4;
    border-bottom: 1px solid $gray-200;
    background-color: white;
    gap: $spacing-4;

    > .title {
      display: flex;
      gap: $spacing-2;
      padding: $spacing-1;
      background-color: $gray-100;
      border-radius: 8px;
      border: 1px solid $gray-200;

      > .button {
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
