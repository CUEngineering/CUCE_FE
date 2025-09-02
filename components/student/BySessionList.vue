<template>
  <div
    class="component entry student-by-session-list dashlet-wrapper"
    :class="{ empty: !students.length }"
  >
    <div class="filter">
      <!-- Tabs for All students, un assigned, assigned to others -->
      <div class="tabs-filter">
        <button
          class="button"
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          All
        </button>
        <button
          class="button"
          :class="{ active: activeTab === 'none' }"
          @click="activeTab = 'none'"
        >
          Un-Assigned
        </button>
        <button
          class="button"
          :class="{ active: activeTab === 'me' }"
          @click="activeTab = 'me'"
        >
          Assigned To Me
        </button>
        <button
          v-if="authStore.viewerData?.role === 'ADMIN'"
          class="button"
          :class="{ active: activeTab === 'others' }"
          @click="activeTab = 'others'"
        >
          Assigned To Others
        </button>
      </div>
      <div class="session-filter">
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
    <div class="page-header dashlet">
      <div class="title-and-filter">
        <h2 class="heading-txt">Students</h2>
      </div>
      <div
        v-if="students.length > 0"
        class="search-and-actions"
      >
        <div class="search-container">
          <UiFormInput
            id="program-search"
            v-model="searchQuery"
            label=""
            placeholder="Find a student"
            size="sm"
          >
            <template #button>
              <div class="search-icon">
                <IconsSearchIcon />
              </div>
            </template>
          </UiFormInput>
        </div>
      </div>
    </div>
    <Loader v-if="loading" />

    <!-- Empty state for when no enrollments exist -->
    <UiEmptyState
      v-if="!loading && !students.length"
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
        <UiButton
          v-if="authStore.viewerData?.role === 'ADMIN'"
          variant="outline"
          size="sm"
          @click="studentStore.isShowingInviteModal = true"
        >
          <template #icon>
            <IconsPlusIcon />
          </template>
          Add Student
        </UiButton>
      </template>
    </UiEmptyState>

    <!-- enrollments table when enrollments exist -->
    <div
      v-if="!loading && students.length"
      class="students-content dashlet program-tabs"
    >
      <div class="tabs-heading">
        <!-- Tabs for students/courses -->
        <div style="display: flex">
          <h2>Available Students</h2>
          <div
            style="margin: auto; margin-left: 20px"
            class="web profile-count pill p-grey pill-sm"
          >
            ({{ startRecord }} - {{ endRecord }}) of
            {{ totalRecords }}
          </div>
        </div>

        <div
          style="display: flex"
          class="web header-actions"
        >
          <UiButton
            v-if="authStore.viewerData?.role === 'ADMIN'"
            variant="primary"
            size="sm"
            @click="studentStore.isShowingInviteModal = true"
          >
            <template #icon>
              <IconsPlusIcon />
            </template>
            New Student
          </UiButton>
          <IconsFilterIcon
            style="margin-left: 5px"
            class="avatar"
          />
        </div>
      </div>
      <div>
        <div class="web-table">
          <table class="students-table table-container">
            <thead>
              <tr>
                <th
                  v-for="header in tableHeaders"
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
                @click="showStudent(row.original)"
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
                    >
                      <div
                        v-if="
                          authStore.viewerData?.role ===
                            'REGISTRAR' && row.original.can_claim
                        "
                      >
                        <UiButton
                          variant="primary"
                          @click="showClaimDialog(row.original)"
                        >
                          Claim
                        </UiButton>
                      </div>

                      <div
                        v-if="authStore.viewerData?.role === 'ADMIN'"
                        class="dropdown"
                      >
                        <button
                          class="action-button"
                          aria-haspopup="true"
                          :aria-expanded="
                            openDropdownId === row.original.student_id
                          "
                          @click.stop="
                            toggleDropdown(row.original.student_id)
                          "
                        >
                          <IconsDotsVerticalIcon />
                        </button>
                        <transition name="dropdown">
                          <div
                            v-if="
                              openDropdownId ===
                              row.original.student_id
                            "
                            class="dropdown-menu"
                            @click.stop
                          >
                            <button
                              class="dropdown-item"
                              @click.stop="showStudent(row.original)"
                            >
                              <span class="dropdown-icon">
                                <IconsEyeIcon />
                              </span>
                              View Student
                            </button>

                            <button
                              v-if="row.original.can_claim"
                              class="dropdown-item"
                              @click.stop="
                                showClaimDialog(row.original)
                              "
                            >
                              <span class="dropdown-icon">
                                <IconsAcademicCapIcon />
                              </span>
                              Claim Student
                            </button>

                            <button
                              class="dropdown-item"
                              @click.stop="
                                showSuspendDialog(row.original)
                              "
                            >
                              <span class="dropdown-icon">
                                <IconsCloseCircleIcon />
                              </span>
                              Suspend Account
                            </button>

                            <button
                              class="dropdown-item"
                              @click.stop="
                                showDeleteDialog(row.original)
                              "
                            >
                              <span class="dropdown-icon">
                                <IconsDeleteIcon />
                              </span>
                              Remove Account
                            </button>
                          </div>
                        </transition>
                      </div>
                    </div>
                    <div
                      v-else-if="cell.column.id === 'student_id'"
                      class="student-info"
                    >
                      <img
                        :src="
                          cell.row.original.profile_picture ??
                          `https://lccvdfvlczhicqnrelsv.supabase.co/storage/v1/object/public/cuce/static/default.png`
                        "
                        :alt="cell.row.original.reg_number"
                        class="avatar"
                      />
                      <div class="student-details">
                        <div class="student-name">
                          {{ cell.row.original.first_name }}{{ ' '
                          }}{{ cell.row.original.last_name }}
                        </div>
                        <div class="student-id">
                          @{{ cell.row.original.reg_number }}
                        </div>
                      </div>
                    </div>
                    <div v-else-if="cell.column.id === 'email'">
                      <div class="email">
                        {{ cell.row.original.email }}
                        <div
                          v-if="cell.row.original.invitation?.status"
                          :class="[
                            'status-badge',
                            getStatusClass(
                              cell.row.original.invitation.status,
                            ),
                          ]"
                          style="width: fit-content"
                        >
                          {{
                            capitalizeFirst(
                              cell.row.original.invitation.status,
                            )
                          }}
                        </div>
                      </div>
                    </div>
                    <div v-else-if="cell.column.id === 'program'">
                      {{ cell.row.original?.program.program_name }}
                    </div>
                    <div
                      v-else-if="
                        cell.column.id === 'program_program_type'
                      "
                      class="status-badge"
                      :class="
                        getStatusClass(
                          cell.row.original?.program.program_type,
                        )
                      "
                    >
                      {{
                        capitalizeFirst(
                          cell.row.original?.program.program_type,
                        )
                      }}
                    </div>
                    <div v-else-if="cell.column.id === 'registrar'">
                      <template
                        v-if="cell.row.original.registrar?.email"
                      >
                        <div
                          class="student-info status-badge profile-count pill p-grey"
                          style="width: fit-content"
                        >
                          <img
                            :src="
                              cell.row.original.registrar
                                ?.profile_picture ??
                              `https://lccvdfvlczhicqnrelsv.supabase.co/storage/v1/object/public/cuce/static/default.png`
                            "
                            :alt="`${cell.row.original.registrar?.first_name} ${cell.row.original.registrar?.last_name}`"
                            class="avatar"
                          />
                          <div class="student-details">
                            <div class="student-name">
                              {{
                                cell.row.original.registrar
                                  ?.first_name
                              }}
                              {{
                                cell.row.original.registrar?.last_name
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
                      {{ { data: cell.column } }}
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
            :student="row.original"
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
  </div>
</template>

<script setup lang="ts">
import type { ColumnSort, CoreOptions } from '@tanstack/vue-table';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table';
import { orderBy } from 'lodash-es';
import { computed, reactive, ref } from 'vue';
import { capitalizeFirst, getStatusClass } from '~/helper/formatData';
import type { StudentWithRegistrar } from '~/types/student';

const selectedStudent = ref<StudentWithRegistrar | null>(null);

const authStore = useAuthStore();
const studentStore = useStudentStore();
studentStore.sessionStudentsResp.execute({ dedupe: 'cancel' });

watch(selectedStudent, (student) => {
  if (student) {
    studentStore.selectedStudentId = String(student.student_id);
  }
});

const activeTab = computed({
  get() {
    return studentStore.selectedStudentAssignedTo;
  },
  set(v) {
    if (
      String(v) !== String(studentStore.selectedStudentAssignedTo)
    ) {
      studentStore.sessionStudentsResp.clear();
    }

    studentStore.selectedStudentAssignedTo = v;
  },
});

const sessionFilter = useSessionsFilter();
const sessionFilterList = computed(() => {
  return (sessionFilter.data.value ?? []).map((s) => ({
    value: String(s.session_id),
    label: s.session_name,
  }));
});

const selectedSessionId = computed({
  get() {
    return studentStore.selectedStudentSessionId;
  },
  set(v: string) {
    if (String(v) !== String(studentStore.selectedStudentSessionId)) {
      studentStore.sessionStudentsResp.clear();
    }

    studentStore.selectedStudentSessionId = v;
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

const students = computed(
  () => studentStore.sessionStudentsResp.data.value || [],
);

const loading = computed(() => {
  const loadingStatus = studentStore.sessionStudentsResp.status.value;
  if (loadingStatus === 'pending' && !students.value.length) {
    return true;
  }

  return false;
});

const showStudent = async (student: StudentWithRegistrar) => {
  await navigateTo({
    name:
      authStore.role === 'ADMIN'
        ? 'admin-students-studentId'
        : 'registrar-students-studentId',
    params: {
      studentId: student.student_id,
    },
  });
};

const showClaimDialog = async (student: StudentWithRegistrar) => {
  selectedStudent.value = student;
  studentStore.isShowingClaimModal = true;
};

const showSuspendDialog = (student: StudentWithRegistrar) => {
  selectedStudent.value = student;
  studentStore.isShowingSuspendModal = true;
};

const showDeleteDialog = (student: StudentWithRegistrar) => {
  selectedStudent.value = student;
  studentStore.isShowingDeleteModal = true;
};

const openDropdownId = inject<Ref<number | null>>(
  'openDropdownId',
  ref(null),
);

// Toggle dropdown
const toggleDropdown = (studentId: number) => {
  openDropdownId.value =
    openDropdownId.value === studentId ? null : studentId;
};

const columnHelper = createColumnHelper<StudentWithRegistrar>();

const columns = computed(() => {
  const cols: CoreOptions<StudentWithRegistrar>['columns'] = [
    columnHelper.accessor('student_id', {
      header: 'Student Name',
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor('email', {
      header: 'Student Email',
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor('program', {
      header: 'Enrolled Programme',
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor('program.program_type', {
      header: 'Programme Type',
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor('registrar', {
      header: 'Assigned Registrar',
      cell: (props) => props.getValue(),
    }),
  ];

  cols.push(
    columnHelper.display({
      id: 'actions',
      header: 'Action',
      cell: () => {},
    }),
  );

  return cols;
});

const tableState = reactive({
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  sorting: [] as ColumnSort[],
  globalFilter: '',
});

const searchQuery = computed({
  get: () => tableState.globalFilter,
  set: (value) => {
    tableState.globalFilter = value;
  },
});

const table = useVueTable({
  get data() {
    return students.value;
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
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
});

const tableHeaders = computed(
  () => table.getHeaderGroups()[0]?.headers ?? [],
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

const totalRecords = computed(() => students.value.length);

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
  return possibleEnd > totalRecords.value
    ? totalRecords.value
    : possibleEnd;
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

.component.entry.student-by-session-list {
  max-width: 100%;

  &.empty {
    height: 100%;
  }

  > .filter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-4;
    border-bottom: 1px solid $gray-200;
    background-color: white;
    gap: $spacing-4;

    > .tabs-filter {
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

    > .session-filter {
      display: inline-flex;
      margin-left: auto;
      align-items: center;

      :deep() {
        .form-field {
          gap: initial;
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

  // Table styles
  .students-content {
    background-color: $white;
    border-radius: 16px;
    border: 1px solid $gray-200;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    &.dashlet {
      padding: 0;
    }
  }

  .students-table {
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
  box-shadow:
    0px 12px 16px -4px rgba(16, 24, 40, 0.08),
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
