<template>
  <ClientOnly>
    <div
      class="enrollments-page dashlet-wrapper"
      :class="{ empty: !enrollments.length }"
    >
      <div class="page-header dashlet">
        <div class="title-and-filter">
          <h2 class="heading-txt">Enrollments</h2>
          <div
            style="margin: auto"
            class="web profile-count pill p-grey pill-sm"
          >
            {{ enrollments.length }}
          </div>
        </div>
        <div
          v-if="enrollments.length > 0"
          class="search-and-actions"
        >
          <div class="search-container">
            <FormInput
              id="program-search"
              v-model="searchQuery"
              label=""
              placeholder="Find Enrollment"
              size="sm"
            >
              <template #button>
                <div class="search-icon">
                  <IconsSearchIcon />
                </div>
              </template>
            </FormInput>
          </div>
          <div class="tabs-heading">
            <div class="web header-actions">
              <FilterIcon class="avatar" />
            </div>
          </div>
        </div>
      </div>
      <Loader v-if="loading" />

      <!-- Empty state for when no enrollments exist -->
      <EmptyState
        v-if="!loading && !enrollments.length"
        class="dashlet"
        title="Enrollments"
        description="There are currently no enrollments available for this current session at this time."
      >
        <template #icon>
          <img
            src="~/assets/images/global-education3.svg"
            alt="Users Illustration"
            class="empty-state-illustration"
          />
        </template>
      </EmptyState>

      <!-- enrollments table when enrollments exist -->
      <div
        v-if="!loading && enrollments.length"
        class="enrollments-content dashlet program-tabs"
      >
        <div>
          <div class="web-table">
            <table class="enrollments-table table-container">
              <thead>
                <tr>
                  <th
                    v-for="header in table.getHeaderGroups()[0]
                      .headers"
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
                        typeof cell.column.columnDef.cell ===
                        'function'
                      "
                    >
                      <div
                        v-if="cell.column.id === 'actions'"
                        class="action-cell"
                      >
                        <div v-if="canReEnroll(row.original)">
                          <Button
                            variant="secondary"
                            @click="enroll(row.original)"
                          >
                            Re-Enroll
                          </Button>
                        </div>

                        <div v-if="canRequest(row.original)">
                          <Button
                            variant="yellow"
                            @click="request(row.original)"
                          >
                            Request
                          </Button>
                        </div>
                      </div>

                      <div
                        v-else-if="cell.column.id === 'courseStatus'"
                        class="status-badge"
                        :class="
                          getStatusClass(cell.renderValue() as string)
                        "
                      >
                        <span class="status-dot"></span>
                        {{
                          capitalizeFirst(
                            cell.renderValue() as string,
                          )
                        }}
                      </div>
                      <div
                        v-else-if="cell.column.id === 'status'"
                        class="status-badge"
                        :class="
                          getStatusClass(cell.renderValue() as string)
                        "
                      >
                        <span class="status-dot"></span>
                        {{
                          capitalizeFirst(
                            cell.renderValue() as string,
                          )
                        }}
                      </div>
                      <div
                        v-else-if="cell.column.id === 'courseCredit'"
                        class="courses-cell"
                      >
                        <div
                          style="
                            padding: 3px 12px;
                            text-align: center;
                          "
                          class="profile-count pill p-grey status-badge"
                        >
                          {{ cell.renderValue() }}
                        </div>
                      </div>

                      <div
                        v-else-if="cell.column.id === 'courseCode'"
                        class="courses-cell"
                        style="display: flex; flex-direction: row"
                      >
                        <div
                          style="
                            padding: 3px 12px;
                            text-align: center;
                          "
                          class="profile-count pill p-grey status-badge"
                        >
                          {{ cell.renderValue() }}
                        </div>

                        <div
                          v-if="
                            cell.row.original.courseStatus ===
                            'CLOSED'
                          "
                          style="
                            text-align: center;
                            margin-left: 10px;
                          "
                          class="status-badge status-deactivated"
                        >
                          <span><StatusBadge /></span>
                          {{ cell.row.original.courseStatus }}
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
            <StudentMain
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :selected-course="row.original"
              @viewDetails="viewCourseDetails(row.original as any)"
            />
          </div>
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
      </div>
      <Dialog
        v-model="showEnrollModal"
        title="Enroll"
        :message="`Are you sure you want to enroll in ${selectedEnrollment?.courseCode} this session? Click 'Yes' to continue`"
        variant="warning"
        :loading="isActionLoading"
        confirm-button-text="Yes, Enroll"
        cancel-button-text="No, cancel"
        @confirm="handleEnrollAction"
      />
      <Dialog
        v-model="showRequestModal"
        title="Submit a request"
        :message="`This class (${selectedEnrollment?.courseCode}) is <strong>currently closed</strong> for this session. Please Confirm your request to be added to the class`"
        variant="warning"
        :loading="isActionLoading"
        confirm-button-text="Submit Request"
        cancel-button-text="Cancel"
        @confirm="handleRequestAction"
      />

      <Dialog
        v-model="showSuccessDialog"
        title="Request Sent"
        :message="`Your request to be added to ${selectedEnrollment?.courseCode} has successfully been sent.`"
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
        v-if="showInfoModal && selectedEnrollmentAsCourseData"
        v-model="showInfoModal"
        :loading="isActionLoading"
        :course="selectedEnrollmentAsCourseData"
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
import { isFunction } from 'lodash-es';
import { computed, reactive, ref } from 'vue';
import FilterIcon from '~/components/icons/FilterIcon.vue';
import StatusBadge from '~/components/icons/StatusBadge.vue';
import StudentMain from '~/components/student/studentMain.vue';
import Button from '~/components/ui/Button.vue';
import Dialog from '~/components/ui/Dialog.vue';
import EmptyState from '~/components/ui/EmptyState.vue';
import FormInput from '~/components/ui/FormInput.vue';
import { capitalizeFirst, getStatusClass } from '~/helper/formatData';
import type { EnrollmentListType } from '~/types/enrollment';

// const toast = useToast();

const authState = useAuthStore();
const studentStore = useStudentStore();

const loading = computed(
  () =>
    !studentStore.enrollmentsResp.data.value.length &&
    studentStore.enrollmentsResp.status.value === 'pending',
);

const enrollments = computed(() => {
  const list = studentStore.enrollmentsResp.data.value || [];
  return list;
});

onMounted(() => {
  studentStore.enrollmentsResp.refresh({ dedupe: 'cancel' });
});

const columnHelper = createColumnHelper<EnrollmentListType>();

const columns = computed(() => {
  const cols = [
    columnHelper.accessor('courseName', {
      header: 'Course Title',
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor('courseCode', {
      header: 'Course',
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor('status', {
      header: 'Request Status',
      cell: (props) => props.getValue() as string,
    }),
    columnHelper.accessor('reason', {
      header: 'Rejection Reason',
      cell: (props) => props.getValue() as string,
    }),
    columnHelper.accessor('courseCredit', {
      header: 'Credit Value',
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor('courseStatus', {
      header: 'Course Status',
      cell: (props) => props.getValue(),
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
    courseName: true,
    courseCode: true,
    status: true,
    reason: false,
    courseCredit: true,
    courseStatus: true,
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

const hasRejectedEnrollment = computed(() =>
  enrollments.value.some((e) => e.status === 'rejected'),
);

watch(
  hasRejectedEnrollment,
  (hasRejectedEnrollment) => {
    table.setColumnVisibility((visibilityState) => {
      return {
        ...visibilityState,
        reason: hasRejectedEnrollment,
      };
    });
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

const canReEnroll = (enrollment: EnrollmentListType) => {
  const courseEnrollmentData =
    studentStore.getEnrollmentAsCourseListData(enrollment);
  return courseEnrollmentData.can_enroll;
};

const canRequest = (enrollment: EnrollmentListType) => {
  const courseEnrollmentData =
    studentStore.getEnrollmentAsCourseListData(enrollment);
  return courseEnrollmentData.can_request;
};

const selectedEnrollment = ref<EnrollmentListType | null>(null);
const selectedEnrollmentAsCourseData = computed(() =>
  selectedEnrollment.value
    ? studentStore.getEnrollmentAsCourseListData(
        selectedEnrollment.value,
      )
    : undefined,
);

const showEnrollModal = ref(false);
const showRequestModal = ref(false);
const showInfoModal = ref(false);
const isActionLoading = ref(false);
const showSuccessDialog = ref(false);
const showFailureDialog = ref(false);

const enroll = async (rowData: EnrollmentListType) => {
  selectedEnrollment.value = rowData;
  showEnrollModal.value = true;
};

const request = async (rowData: EnrollmentListType) => {
  selectedEnrollment.value = rowData;
  showRequestModal.value = true;
};

const viewCourseDetails = async (rowData: EnrollmentListType) => {
  selectedEnrollment.value = rowData;
  showInfoModal.value = true;
};

const handleEnrollAction = async () => {
  if (!(authState.user?.student_id && selectedEnrollment.value)) {
    return;
  }

  const { call } = useBackendService(`/enrollments`, 'post');

  isActionLoading.value = true;
  try {
    await call({
      student_id: authState.user.student_id,
      course_id: Number(selectedEnrollment.value.courseId),
      session_id: Number(selectedEnrollment.value.sessionId),
      enrollment_status: 'PENDING',
    });
    await studentStore.enrollmentsResp.refresh({ dedupe: 'cancel' });
    showSuccessDialog.value = true;

    showRequestModal.value = false;
    selectedEnrollment.value = null;
  } catch (error) {
    showFailureDialog.value = true;
  } finally {
    isActionLoading.value = false;
  }
};

const handleRequestAction = async () => {
  if (!(authState.user?.student_id && selectedEnrollment.value)) {
    return;
  }

  const { call } = useBackendService(`/enrollments`, 'post');

  isActionLoading.value = true;
  try {
    await call({
      student_id: authState.user.student_id,
      course_id: Number(selectedEnrollment.value.courseId),
      session_id: Number(selectedEnrollment.value.sessionId),
      enrollment_status: 'PENDING',
    });

    await studentStore.enrollmentsResp.refresh({ dedupe: 'cancel' });
    showSuccessDialog.value = true;
    showRequestModal.value = false;
    selectedEnrollment.value = null;
  } catch (error) {
    showFailureDialog.value = true;
  } finally {
    isActionLoading.value = false;
  }
};

const goToPage = (pageIndex: number) => {
  table.setPageIndex(pageIndex);
};

definePageMeta({
  layout: 'student',
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
