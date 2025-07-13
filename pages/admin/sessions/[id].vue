<template>
  <div class="programs-page dashlet-wrapper">
    <Loader v-if="isLoading || courseLoading || studentLoading" />

    <div class="page-header dashlet">
      <div class="page-title">
        <button class="back-icon" @click="back">
          <ArrowLeftIcon />
        </button>
        <h2 class="heading-txt">Session Details</h2>
      </div>
    </div>

    <div class="dashlet program-details">
      <div class="program-overview">
        <div style="display: flex">
          <h1 class="program-title">{{ sessions?.session_name }}</h1>
          <IconsEditIcon
            @click="edit"
            style="margin-top: 5px; margin-left: 5px; cursor: pointer"
          />
        </div>

        <div class="overview-stats">
          <div class="stat-card">
            <div class="stat-label">Duration</div>
            <div class="inlineborder profile-count pill p-grey">
              <div>
                <span><SessionIcon /></span>
                {{ formatDate(sessions?.start_date || "") }} -
                {{ formatDate(sessions?.end_date || "") }}
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Session Status</div>
            <div class="stat-details">
              <div
                class="status-badge"
                :class="getStatusClass(sessions?.session_status || '')"
              >
                <span class="status-dot"></span>
                {{ getStatusText(sessions?.session_status || "") }}
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Enrollment Deadline</div>
            <div
              style="padding: 5px 15px; text-align: center; margin-left: 10px"
              class="profile-count pill p-grey"
            >
              <span><SessionIcon /></span>
              {{ formatDate(sessions?.enrollment_deadline || "") }}
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Total Courses</div>

            <div class="stat-details">
              <div
                style="padding: 5px 15px; text-align: center; margin-left: 10px"
                class="profile-count pill p-grey"
              >
                {{ sessions?.session_courses.length }}
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Enrolled Students</div>

            <div class="stat-details">
              <div
                style="padding: 5px 15px; text-align: center; margin-left: 10px"
                class="profile-count pill p-grey"
              >
                {{ sessions?.session_students.length }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="enrollments-content dashlet program-tabs">
      <div class="tabs-heading">
        <!-- Tabs for students/courses -->
        <div style="display: flex">
          <div class="program-tab-title">
            <button
              class="tab-button"
              :class="{ active: activeTab === 'students' }"
              @click="activeTab = 'students'"
            >
              Students
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === 'courses' }"
              @click="activeTab = 'courses'"
            >
              Courses
            </button>
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
          <div
            style="margin-left: 10px; margin-right: 10px"
            v-if="activeTab === 'students'"
          >
            <Button variant="primary" size="sm">
              <template #icon>
                <PlusIcon />
              </template>
              Add Student
            </Button>
          </div>
          <div class="mobile-table"></div>

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
                  <div v-if="cell.column.id === 'actions'" class="action-cell">
                    <div v-if="activeTab === 'courses'">
                      <label class="switch">
                        <!-- <input type="checkbox" id="toggle" /> -->
                        <input
                          type="checkbox"
                          :id="`toggle-${cell.row.original.courseId}`"
                          :checked="cell.row.original.status === 'OPEN'"
                          @change="
                            handleToggleChange(cell.row.original, $event)
                          "
                        />
                        <span class="slider"></span>
                      </label>
                    </div>

                    <button v-else class="action-button edit-button">
                      <DeleteIcon
                        @click="handleDeleteStudent(cell.row.original)"
                      />
                    </button>
                  </div>

                  <div
                    v-else-if="cell.column.id === 'status'"
                    class="status-badge"
                    :class="getStatusClass(cell.renderValue() as string)"
                  >
                    <span class="status-dot"></span>
                    {{ capitalizeFirst(cell.renderValue() as string) }}
                  </div>
                  <div
                    v-else-if="cell.column.id === 'firstName'"
                    class="student-info"
                  >
                    <img
                      :src="cell.row.original.profilePicture"
                      alt="Image"
                      class="avatar"
                    />
                    <div class="student-details">
                      <div class="student-name">
                        {{ cell.row.original.firstName }}{{ " " }}
                        {{ cell.row.original.lastName }}
                      </div>
                    </div>
                  </div>
                  <div
                    v-else-if="cell.column.id === 'studentId'"
                    class="student-info"
                  >
                    <div class="student-details">
                      <div class="">
                        {{ cell.row.original.program.name }}
                      </div>
                    </div>
                  </div>
                  <div
                    v-else-if="cell.column.id === 'regNumber'"
                    class="student-info"
                  >
                    <div class="student-details">
                      <div class="stat-details">
                        <div
                          class="status-badge"
                          :class="
                            getStatusClass(cell.row.original.program.type || '')
                          "
                        >
                          {{ cell.row.original.program.type }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    v-else-if="cell.column.id === 'type'"
                    class="student-info"
                  >
                    <div class="student-details">
                      <div class="stat-details">
                        <div
                          class="status-badge"
                          :class="getStatusClass(cell.row.original.type)"
                        >
                          {{ cell.row.original.type }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    v-else-if="cell.column.id === 'credits'"
                    class="courses-cell"
                    style="display: flex; flex-direction: row"
                  >
                    <div class="stat-details">
                      <div
                        style="
                          padding: 5px 15px;
                          text-align: center;
                          margin-left: 10px;
                        "
                        class="profile-count pill p-grey"
                      >
                        {{ cell.row.original.credits }}
                      </div>
                    </div>
                  </div>
                  <div
                    v-else-if="cell.column.id === 'numberOfStudents'"
                    class="courses-cell"
                    style="display: flex; flex-direction: row"
                  >
                    <div class="stat-details">
                      <div
                        style="
                          padding: 5px 15px;
                          text-align: center;
                          margin-left: 10px;
                        "
                        class="profile-count pill p-grey"
                      >
                        {{ cell.row.original.numberOfStudents }}
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
          <MobileStudent
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            v-bind="row.original"
            @action="handleDeleteStudent(row.original)"
          />
        </div>
        <div v-if="activeTab === 'courses'">
          <MobileCourses
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            v-bind="row.original"
            @action="() => {}"
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
    <EditSession
      v-model="showEditModal"
      mode="edit"
      :session="sessions"
      @sessionUpdate="handleEditSession"
    />
    <Dialog
      v-model="showDeleteConfirm"
      title="Remove Student?"
      :message="`Are you sure you want to remove (${selectedStudent?.firstName} ${selectedStudent?.lastName}) from this session (${sessions?.session_name} session)`"
      variant="danger"
      :loading="isActionLoading"
      confirm-button-text="Yes, Remove"
      @confirm="confirmDeleteStudent"
    />

    <Dialog
      v-model="showCourseStatusModal"
      :title="courseStatusAction === 'open' ? 'Open Course?' : 'Close Course?'"
      :message="`Are you sure you want to ${courseStatusAction} this course (${
        selectedCourse?.title || 'this course'
      })?`"
      :variant="courseStatusAction === 'open' ? 'success' : 'warning'"
      :loading="isActionLoading"
      :confirm-button-text="
        courseStatusAction === 'open' ? 'Yes, Open' : 'Yes, Close'
      "
      @confirm="confirmCourseStatusChange"
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
import ArrowLeftIcon from "~/components/icons/ArrowLeftIcon.vue";
import DeleteIcon from "~/components/icons/DeleteIcon.vue";
import FilterIcon from "~/components/icons/FilterIcon.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import SessionIcon from "~/components/icons/sessionIcon.vue";
import EditSession from "~/components/session/EditSession.vue";
import MobileCourses from "~/components/session/MobileCourses.vue";
import MobileStudent from "~/components/session/MobileStudent.vue";
import Button from "~/components/ui/Button.vue";
import Dialog from "~/components/ui/Dialog.vue";
import FormInput from "~/components/ui/FormInput.vue";
import {
  capitalizeFirst,
  formatDate,
  getStatusClass,
  getStatusText,
} from "~/helper/formatData";

definePageMeta({
  layout: "dashboard",
});
const route = useRoute();
const sessionId = route.params.id as string;
const activeTab = ref("students");
const showEditModal = ref(false);

const back = () => {
  navigateTo("/admin/sessions");
};
const edit = () => {
  showEditModal.value = true;
};

export interface SessionCourse {
  status: string;
  session_id: number;
  adjusted_capacity: number;
}

export interface SessionStudent {
  session_id: number;
  student_id: number;
}

export interface Session {
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
export interface Student {
  id: number;
  student_id: number;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
  program: {
    name: string;
    type: string;
  };
  status?: string;
  regNumber?: string;
  type?: string;
}
export interface Course {
  courseId: number;
  title?: string;
  status: "OPEN" | "CLOSED";
}
const toast = useToast();
const showDeleteConfirm = ref(false);
const isActionLoading = ref(false);

const selectedStudent = ref<Student | null>(null);
const selectedCourse = ref<Course | null>(null);
const courseStatusAction = ref<"open" | "close">("open");
const pendingToggleEvent = ref<Event | null>(null);
const showCourseStatusModal = ref(false);

const sessions = ref<Session | null>(null);
const students = ref<any[]>([]);
const courses = ref<any[]>([]);

const handleDeleteStudent = (student: Student) => {
  selectedStudent.value = student;
  showDeleteConfirm.value = true;
};
const handleToggleChange = (course: Course, event: Event) => {
  event.preventDefault();
  const target = event.target as HTMLInputElement;
  const isCurrentlyOpen = course.status === "OPEN";
  selectedCourse.value = course;
  courseStatusAction.value = isCurrentlyOpen ? "close" : "open";
  pendingToggleEvent.value = event;
  showCourseStatusModal.value = true;
};

const confirmCourseStatusChange = async () => {
  if (!selectedCourse.value) return;

  const newStatus = courseStatusAction.value === "open" ? "OPEN" : "CLOSED";

  const { call: updateCourseStatus } = useBackendService(
    `/sessions/${sessionId}/courses/${selectedCourse.value.courseId}/status`,
    "patch"
  );

  isActionLoading.value = true;

  try {
    await updateCourseStatus({
      status: newStatus,
    });

    const courseIndex = courses.value.findIndex(
      (c) => c.courseId === selectedCourse.value?.courseId
    );
    if (courseIndex !== -1) {
      courses.value[courseIndex].status = newStatus;
    }

    toast.success(
      `Course has been ${
        courseStatusAction.value === "open" ? "opened" : "closed"
      } successfully`
    );

    if (pendingToggleEvent.value) {
      const target = pendingToggleEvent.value.target as HTMLInputElement;
      target.checked = newStatus === "OPEN";
    }

    await refreshSessionData();
  } catch (error) {
    console.error("Error updating course status:", error);
    toast.error(`Failed to ${courseStatusAction.value} course`);
  } finally {
    isActionLoading.value = false;
    showCourseStatusModal.value = false;
    selectedCourse.value = null;
    pendingToggleEvent.value = null;
  }
};

const confirmDeleteStudent = async () => {
  if (!selectedStudent.value) return;

  const { call: deleteStudentFromSession } = useBackendService(
    `/sessions/${sessionId}/students/${selectedStudent.value.student_id}`,
    "delete"
  );

  isActionLoading.value = true;

  try {
    await deleteStudentFromSession();

    toast.success(
      `${selectedStudent.value.firstName} ${selectedStudent.value.lastName} has been removed from the session`
    );

    await refreshSessionData();
  } catch (error) {
    console.error("Error removing student:", error);
    toast.error("Failed to remove student from session");
  } finally {
    isActionLoading.value = false;
    showDeleteConfirm.value = false;
    selectedStudent.value = null;
  }
};
const refreshSessionData = async () => {
  try {
    const { call: fetchSession } = useBackendService(
      `/sessions/${sessionId}`,
      "get"
    );
    const sessionData = await fetchSession();
    sessions.value = sessionData;
  } catch (error) {
    console.error("Error refreshing session data:", error);
    toast.error("Failed to refresh session data");
  }
};

const { call, isLoading, data } = useBackendService(
  `/sessions/${sessionId}`,
  "get"
);
const {
  call: courseCall,
  isLoading: courseLoading,
  data: courseData,
} = useBackendService(`/sessions/${sessionId}/courses`, "get");
const { call: studentCall, data: studentData } = useBackendService(
  `/sessions/${sessionId}/students`,
  "get"
);
const { call: updated, isLoading: studentLoading } = useBackendService(
  `/sessions/${sessionId}`,
  "patch"
);

const handleEditSession = async (update: Partial<Session>) => {
  if (sessions.value) {
    sessions.value = {
      ...sessions.value,
      session_name: update.session_name ?? sessions.value.session_name,
      start_date: update.start_date ?? sessions.value.start_date,
      end_date: update.end_date ?? sessions.value.end_date,
      enrollment_deadline:
        update.enrollment_deadline ?? sessions.value.enrollment_deadline,
    };
  }
  await updated({
    session_name: sessions.value?.session_name,
    start_date: sessions.value?.start_date,
    end_date: sessions.value?.end_date,
    enrollment_deadline: sessions.value?.end_date,
  });
  console.log(sessions.value);

  toast.success("Session updated successfully");
};

onMounted(fetchSession);

async function fetchSession() {
  try {
    await call();
    await courseCall();
    await studentCall();
    sessions.value = data.value || null;
    courses.value = courseData.value || [];
    students.value = studentData.value || [];
  } catch (err) {
    toast.error("Failed to fetch Session details");
  }
}

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
        cell: (props) => {
          const student = props.row.original;
          return h("div", { class: "student-info" }, [
            h("img", {
              src: student.profilePicture || "/default-avatar.png",
              alt: `${student.firstName} ${student.lastName}`,
              class: "avatar",
            }),
            h("div", { class: "student-details" }, [
              h(
                "div",
                { class: "student-name" },
                `${student.firstName} ${student.lastName}`
              ),
            ]),
          ]);
        },
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (props) => props.getValue(),
      }),
      columnHelper.accessor("regNumber", {
        header: "Programme Type",
        cell: (props) => {
          const student = props.row.original;
          return h("div", { class: "student-info" }, [
            h("div", { class: "student-details" }, [
              h("div", { class: "student-name" }, `${student.program.type}`),
            ]),
          ]);
        },
      }),
      columnHelper.accessor("studentId", {
        header: "Programme Name",
        cell: (props) => {
          const student = props.row.original;
          return h("div", { class: "student-info" }, [
            h("div", { class: "student-details" }, [
              h("div", { class: "student-name" }, `${student.program.name}`),
            ]),
          ]);
        },
      }),

      columnHelper.display({
        id: "actions",
        header: "Action",
        cell: () => {},
      }),
    ];
  } else if (activeTab.value === "courses") {
    // Course columns
    return [
      columnHelper.accessor("title", {
        header: "Course Title",
        cell: (props) => props.getValue(),
      }),
      columnHelper.accessor("code", {
        header: "Course Code",
        cell: (props) => {
          const course = props.row.original;
          return h(
            "div",
            {
              class: "courses-cell",
              style: "display: flex; flex-direction: row",
            },
            [
              h(
                "div",
                {
                  class: "profile-count pill p-grey status-badge",
                  style: "padding: 3px 12px; text-align: center",
                },
                course.code
              ),
              course.status === "CLOSED"
                ? h(
                    "div",
                    {
                      class: "status-badge status-deactivated",
                      style: "text-align: center; margin-left: 10px",
                    },
                    [h("span", [h("StatusBadge")]), course.status]
                  )
                : null,
            ]
          );
        },
      }),
      columnHelper.accessor("type", {
        header: "Course Type",
        cell: (props) => props.getValue(),
      }),
      columnHelper.accessor("credits", {
        header: "Course Credits",
        cell: (props) => props.getValue(),
      }),

      columnHelper.accessor("numberOfStudents", {
        header: "Enrolled Students",
        cell: (props) => props.getValue(),
      }),
      columnHelper.display({
        id: "actions",
        header: "Action",
        cell: () => {},
      }),
    ];
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
