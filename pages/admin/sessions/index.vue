<template>
  <div class="registrars-page">
    <div
      class="content-container dashlet-wrapper"
      :class="{ 'is-empty': filteredSessions.length === 0 }"
    >
      <div class="page-header dashlet">
        <div class="title-section">
          <h2 class="page-title heading-txt">Sessions</h2>
        </div>
        <div class="search-container search-and-actions">
          <FormInput
            id="registrar-search"
            label=""
            v-model="searchQuery"
            placeholder="Search a Session"
            size="sm"
          >
            <template #button>
              <div class="search-icon">
                <IconsSearchIcon />
              </div>
            </template>
          </FormInput>
          <Button @click="add" variant="secondary" size="sm">
            <template #icon>
              <PlusIcon />
            </template>
            New Session
          </Button>
        </div>
      </div>
      <Loader v-if="loading" />
      <div
        class="registrars-list dashlet"
        :class="{ 'is-empty': filteredSessions.length === 0 }"
        v-if="!loading"
      >
        <!-- Empty state for registrars -->
        <EmptyState
          v-if="filteredSessions.length === 0"
          class="empty-state"
          title="No Sessions"
          description="To begin, kindly create a new session."
        >
          <template #icon>
            <img
              src="~/assets/images/session.svg"
              alt="Users Illustration"
              class="empty-state-illustration"
            />
          </template>
          <template #action>
            <Button @click="add" variant="outline" size="sm">
              <template #icon>
                <PlusIcon />
              </template>
              New Session
            </Button>
          </template>
        </EmptyState>

        <Card
          v-else
          v-for="(session, index) in filteredSessions"
          :key="index"
          :session="session"
          @edit-session="handleEditSession"
          @adjust-enrollment="handleAdjustEnrollment"
          @start-session="handleStartSession"
          @delete-session="handleDeleteSession"
          @close-session="handleCloseSession"
          @view-session="handleViewSession"
        />
      </div>
      <div
        v-if="filteredSessions.length > 0 && !loading"
        class="programs-content dashlet"
      >
        <div
          style="
            padding: 15px;
            display: flex;
            flex-direction: row;
            align-items: center;
          "
          class="title-section"
          sty
        >
          <h2 class="page-title heading-txt">Past Sessions</h2>
          <div
            style="width: fit-content; margin-left: 5px"
            class="profile-count pill p-grey pill-sm"
          >
            {{
              filteredSessions.length > 0
                ? `${filteredSessions.length}`
                : "No past sessions"
            }}
          </div>
        </div>
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
                  <div v-if="cell.column.id === 'actions'" class="action-cell">
                    <button class="action-button delete-button">
                      <ActionCancelIcon />
                    </button>
                    <button class="action-button edit-button">
                      <ActionEditIcon />
                    </button>
                  </div>
                  <div
                    v-else-if="cell.column.id === 'startDate'"
                    style="
                      text-align: center;
                      margin-left: 10px;
                      width: max-content;
                      padding-left: 10px;
                      padding-right: 10px;
                    "
                    class="profile-count pill p-grey"
                  >
                    <span><SessionIcon /></span>
                    {{ formatDate(cell.row.original.startDate) }}-
                    {{ formatDate(cell.row.original.endDate) }}
                  </div>
                  <div
                    v-else-if="cell.column.id === 'numberOfOpenCourses'"
                    style="text-align: center; margin-left: 10px"
                    class="profile-count pill p-grey custompill"
                  >
                    {{ cell.row.original.numberOfOpenCourses }}
                  </div>
                  <div
                    v-else-if="cell.column.id === 'numberOfStudents'"
                    style="text-align: center; margin-left: 10px"
                    class="profile-count pill p-grey custompill"
                  >
                    {{ cell.row.original.numberOfStudents }}
                  </div>
                  <div
                    v-else-if="cell.column.id === 'enrollmentDeadline'"
                    style="text-align: center; margin-left: 10px"
                    class="profile-count pill p-grey"
                  >
                    <span><SessionIcon /></span>
                    {{ formatDate(cell.row.original.enrollmentDeadline) }}
                  </div>

                  <div v-else>
                    {{ cell.renderValue() }}
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="mobile-table" style="padding: 10px">
          <Card
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :session="row.original"
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

        <Dialog
          v-model="showStartConfirm"
          title="Start Session?"
          :message="`Are you sure you want to start ${selectedSession?.sessionName} Session? Once closed, it can no longer be opened.`"
          variant="warning"
          :loading="isActionLoading"
          confirm-button-text="Start"
          @confirm="confirmStart"
        />
        <Dialog
          v-model="showSuspendConfirm"
          title="Close Session?"
          :message="`Are you sure you want to close ${selectedSession?.sessionName} Session? Once closed, it can no longer be opened.`"
          variant="danger"
          :loading="isActionLoading"
          confirm-button-text="Close"
          @confirm="confirmClose"
        />
        <Dialog
          v-model="showDeleteConfirm"
          title="Delete Session?"
          :message="`Are you sure you want to delete ${selectedSession?.sessionName} Session? Once closed, it can no longer be opened.`"
          variant="danger"
          :loading="isActionLoading"
          confirm-button-text="Remove"
          @confirm="confirmDelete"
        />
      </div>
    </div>
    <AddStudentModal
      v-model="showAddStudent"
      @click="handleAddStudentFromModal"
      mode="main"
      @submit-session-form="handleAddStudentFinal"
    />

    <EditSession
      v-model="showAddModal"
      mode="add"
      @sessionUpdate="handleAddSession"
      @add-student="handleAddStudentFromModal"
      @submit-session-form="handleAddStudentSubmit"
    />

    <!-- Toast Container -->
    <ToastContainer />
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
import { ref } from "vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import SessionIcon from "~/components/icons/sessionIcon.vue";
import Loader from "~/components/Loader.vue";
import AddStudentModal from "~/components/session/AddStudentModal.vue";
import Card from "~/components/session/card.vue";
import EditSession from "~/components/session/EditSession.vue";
import Button from "~/components/ui/Button.vue";
import Dialog from "~/components/ui/Dialog.vue";
import EmptyState from "~/components/ui/EmptyState.vue";
import FormInput from "~/components/ui/FormInput.vue";
import ToastContainer from "~/components/ui/ToastContainer.vue";
import { useToast } from "~/composables/useToast";
import { formatDate } from "~/helper/formatData";
import type { SessionCourse, SessionStudent } from "./[id].vue";

definePageMeta({
  layout: "dashboard",
});

interface Session {
  sessionId: number;
  sessionName: string;
  startDate: string;
  endDate: string;
  enrollmentDeadline: string;
  sessionStatus: string;
  numberOfOpenCourses: number;
  numberOfStudents: number;
}
interface CamelCAse {
  session_id: number;
  session_name: string;
  start_date: string;
  end_date: string;
  enrollment_deadline: string;
  session_status: string;
  created_at: string;
  updated_at: string;
  session_courses: SessionCourse[];
  session_students: SessionStudent[];
}
const toast = useToast();
const showAddModal = ref(false);
const showAddStudent = ref(false);
let newSessionFormData = ref(null);

const handleAddStudentFromModal = () => {
  showAddModal.value = false;
  showAddStudent.value = true;
};

const { call: create } = useBackendService(`/sessions`, "post");
const { call: createWstudents } = useBackendService(
  `/sessions/with-students`,
  "post"
);

const add = () => {
  showAddModal.value = true;
};
const loading = ref(false);
const { call: fetchSessions, data: currentData } = useBackendService(
  "/sessions",
  "get"
);
const { call: fetchClosedSessions, data: closedData } = useBackendService(
  "/sessions",
  "get"
);

const sessions = ref<Session[]>([]);
const closedSessions = ref<Session[]>([]);
const filteredSessions = computed(() => {
  if (!searchQuery.value.trim()) return sessions.value;
  const query = searchQuery.value.toLowerCase();
  return sessions.value.filter((registrar) =>
    registrar.sessionName.toLowerCase().includes(query)
  );
});

const registrarDataCache = useState("sessionDataCah", () => null);
const closedDataCche = useState("closedSessionCah", () => null);

const fetchData = async () => {
  await fetchSessions({ status: "not_closed" });
  registrarDataCache.value = currentData.value;
  sessions.value = currentData.value || [];

  await fetchClosedSessions({ status: "closed" });
  closedDataCche.value = closedData.value;
  closedSessions.value = closedData.value || [];
};

onMounted(async () => {
  if (!closedDataCche.value && !registrarDataCache.value) {
    try {
      loading.value = true;
      await fetchData();
      loading.value = false;
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  }

  if (closedDataCche.value || registrarDataCache.value) {
    sessions.value = registrarDataCache.value || [];
    closedSessions.value = closedDataCche.value || [];
  }
});

const tableState = reactive({
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  sorting: [] as ColumnSort[],
  globalFilter: "",
});

const columnHelper = createColumnHelper<Session>();

const columns = [
  columnHelper.accessor("sessionName", {
    header: "Session Name",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("startDate", {
    header: "Duration",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("numberOfStudents", {
    header: "Enrolled Students",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("numberOfOpenCourses", {
    header: "Open Courses",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("enrollmentDeadline", {
    header: "Enrollment Deadline",
    cell: (props) => props.getValue(),
  }),
];
const searchQuery = computed({
  get: () => tableState.globalFilter,
  set: (value) => {
    tableState.globalFilter = value;
  },
});
const table = useVueTable({
  get data() {
    return closedSessions.value;
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
const calculatePageRange = () => {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const maxVisiblePages = 8;

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

const handleViewSession = (session: Session) => {
  return navigateTo(`/admin/sessions/${session.sessionId}`);
};
const handleAddStudentSubmit = async (formData: any) => {
  newSessionFormData = { ...formData, session_status: "UPCOMING" };
  await fetchData();
};
const handleAddStudentFinal = async (formData: any) => {
  const payload = {
    data: newSessionFormData,
    studentIds: formData,
  };
  await createWstudents(payload);
  showAddStudent.value = false;
  showAddModal.value = false;
  toast.success(`Adding session completed with students`);
  await fetchData();
  showAddModal.value = false;
};
const handleAddSession = async (session: Partial<CamelCAse>) => {
  await create({
    session_name: session.session_name,
    start_date: session.start_date,
    end_date: session.end_date,
    enrollment_deadline: session.enrollment_deadline,
    session_status: "UPCOMING",
  });
  toast.success(`Adding session completed`);
  await fetchData();
  showAddModal.value = false;
};

const handleEditSession = (session: Session) => {
  return navigateTo(`/admin/sessions/${session.sessionId}`);
};
const showStartConfirm = ref(false);
const showSuspendConfirm = ref(false);
const showDeleteConfirm = ref(false);
const isActionLoading = ref(false);
const selectedSession = ref<Session | null>(null);

const handleAdjustEnrollment = (session: Session) => {
  selectedSession.value = session;
  showSuspendConfirm.value = true;
};

const handleStartSession = (session: Session) => {
  selectedSession.value = session;
  showStartConfirm.value = true;
};

const handleDeleteSession = (session: Session) => {
  selectedSession.value = session;
  showDeleteConfirm.value = true;
};

const handleCloseSession = (session: Session) => {
  selectedSession.value = session;
  showSuspendConfirm.value = true;
};

const confirmStart = async () => {
  const { call: confirmDeactivate } = useBackendService(
    `/sessions/${selectedSession.value?.sessionId}`,
    "patch"
  );

  if (!selectedSession.value) return;

  isActionLoading.value = true;
  try {
    await confirmDeactivate({ session_status: "ACTIVE" });

    toast.success(`${selectedSession.value.sessionName} has now started`);
    await fetchData();
  } catch (error) {
    // Error case
    toast.error("Failed to process");
  } finally {
    isActionLoading.value = false;
    showStartConfirm.value = false;
  }
};
const confirmClose = async () => {
  const { call: confirmDeactivate } = useBackendService(
    `/sessions/${selectedSession.value?.sessionId}`,
    "patch"
  );

  if (!selectedSession.value) return;

  isActionLoading.value = true;
  try {
    await confirmDeactivate({ session_status: "CLOSED" });

    toast.success(`${selectedSession.value.sessionName} is now closed`);
    await fetchData();
  } catch (error) {
    // Error case
    toast.error("Failed to process");
  } finally {
    isActionLoading.value = false;
    showSuspendConfirm.value = false;
  }
};
const confirmDelete = async () => {
  const { call: confirmDeactivate } = useBackendService(
    `/sessions/${selectedSession.value?.sessionId}`,
    "delete"
  );

  if (!selectedSession.value) return;

  isActionLoading.value = true;
  try {
    await confirmDeactivate();

    toast.success(`${selectedSession.value.sessionName} is now deleted`);
    await fetchData();
  } catch (error) {
    // Error case
    toast.error("Course has active students, cannot delete");
  } finally {
    isActionLoading.value = false;
    showDeleteConfirm.value = false;
  }
};
</script>

<style lang="scss" scoped>
.registrars-page {
  .custompill {
    margin: auto;
    width: 40px;
  }
  height: calc(100vh - 88px); // Adjust based on your header height
  display: flex;
  gap: 10px;
  flex-direction: column;
  height: auto;
  min-height: 100vh;

  .content-container {
    flex: 1;
    min-height: 0;
    align-self: start;
    max-height: 100%;

    &.is-empty {
      align-self: auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 16px;
      background: $white;

      .title-section {
        display: flex;
        align-items: baseline;
        gap: 8px;

        .page-title {
          font-family: $font-family-heading;
          font-size: $text-2xl;
          font-weight: 800;
          color: $gray-800;
          margin: 0;
        }

        .profile-count {
          color: $gray-600;
          font-size: $text-2xl;
        }
      }
    }
    .search-and-actions {
      display: flex;
      gap: $spacing-2;
      width: 40vw;

      :deep(.base-button) {
        width: 20vw;
      }
    }

    .registrars-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1rem;
      align-items: start;
      overflow-y: auto;
      padding: 12px;
      border-radius: 16px;
      min-height: 200px; // Add minimum height for empty state

      &.is-empty {
        flex: 1;
      }

      > .empty-state {
        grid-column: 1 / -1; // Span all columns
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
      }
    }
  }

  .content-container {
    flex: 1;
    min-height: 0;
    width: 100%;

    .registrars-list {
      overflow-y: visible;
    }
  }

  @media (max-width: 768px) {
    .page-header {
      // flex-direction: column;
      align-items: flex-start;

      .search-add-section {
        width: 100%;

        .search-container {
          flex: 1;
        }
      }
    }
  }

  @media (max-width: 640px) {
    .registrars-list {
      grid-template-columns: 1fr;
    }
  }
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
</style>
