<template>
  <div class="program-detail-page dashlet-wrapper">
    <!-- Back button header -->
    <div class="page-header dashlet">
      <div class="page-title">
        <button class="back-icon" @click="navigateBack">
          <ArrowLeftIcon />
        </button>
        <h2 class="heading-txt">Program Details</h2>
      </div>

      <div class="header-actions">
        <Button variant="outline" @click="openEditModal">
          <template #icon>
            <PencilIcon />
          </template>
          Edit
        </Button>
      </div>
    </div>

    <div class="dashlet program-details">
      <!-- Program overview -->
      <div v-if="program" class="program-overview">
        <h1 class="program-title">{{ program.name }}</h1>

        <div class="overview-stats">
          <div class="stat-card">
            <div class="stat-label">Program Type</div>
            <div
              class="pill pill-lg"
              :class="
                program.type.toLowerCase() === 'undergraduate'
                  ? 'p-green'
                  : program.type.toLowerCase() === 'doctorate'
                  ? 'p-yellow'
                  : 'p-blue'
              "
            >
              {{ program.type }}
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Students</div>
            <div class="stat-details">
              <div class="stat-value">{{ program.enrolledStudents }}</div>

              <div class="pill pill-md p-blue-dark">
                +{{
                  program.enrolledStudents === 1
                    ? 1
                    : program.enrolledStudents > 2
                    ? program.enrolledStudents - 2
                    : 0
                }}
                new
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Credits</div>
            <div class="stat-value">{{ program.credits }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Total Courses</div>

            <div class="stat-details">
              <div class="stat-value">{{ program.courses }}</div>
              <div class="pill pill-md p-blue-dark">
                +{{
                  program.courses === 1
                    ? 1
                    : program.courses > 2
                    ? program.courses - 2
                    : 0
                }}
                new
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="program-tabs">
        <div class="tabs-heading">
          <!-- Tabs for students/courses -->
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
          <div class="tab-actions">
            <div class="search-container">
              <FormInput
                id="student-search"
                label=""
                :placeholder="
                  activeTab === 'students' ? 'Find a student' : 'Find a course'
                "
                v-model="searchQuery"
                size="sm"
              >
                <template #button>
                  <div class="search-icon">
                    <IconsSearchIcon />
                  </div>
                </template>
              </FormInput>
            </div>
            <button
              v-if="activeTab === 'courses'"
              class="add-button"
              @click="openAddCoursesModal"
            >
              <IconsPlusIcon />
            </button>
          </div>
        </div>

        <!-- Students tab content -->
        <div v-if="activeTab === 'students'" class="tab-content">
          <!-- Students table -->
          <div class="data-table-container">
            <table class="table-container">
              <thead>
                <tr>
                  <th
                    v-for="header in studentTable.getHeaderGroups()[0].headers"
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
                  v-for="row in studentTable.getRowModel().rows"
                  :key="row.id"
                  class="table-row"
                >
                  <td
                    v-for="cell in row.getVisibleCells()"
                    :key="cell.id"
                    class="table-cell"
                  >
                    <FlexRender
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Add after the students table -->
        <div class="mobile-card-view" v-if="activeTab === 'students'">
          <div
            v-for="student in studentTable.getRowModel().rows"
            :key="student.id"
            class="base-card"
          >
            <div class="card-header-avatar">
              <img
                :src="student.original.avatar"
                class="avatar lg"
                alt="Student avatar"
              />
              <div class="avatar-info">
                <h3 class="avatar-name">{{ student.original.name }}</h3>
                <p class="avatar-email">{{ student.original.email }}</p>
              </div>
            </div>
            <div class="card-progress">
              <div class="progress-container">
                <div
                  class="progress-bar"
                  :style="{
                    width: calculateCreditProgress(
                      student.original.creditsCompleted
                    ),
                  }"
                ></div>
              </div>

              <div class="card-details">
                <div class="detail-item">
                  <div class="detail-icon">
                    <IconsGraduationCapIcon />
                  </div>
                  <span class="detail-label">Credits Completed:</span>

                  <span class="detail-value">{{
                    student.original.creditsCompleted
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Courses tab content -->
        <div v-if="activeTab === 'courses'" class="tab-content">
          <!-- Courses table -->
          <div class="data-table-container">
            <table class="table-container">
              <thead>
                <tr>
                  <th
                    v-for="header in courseTable.getHeaderGroups()[0].headers"
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
                  v-for="row in courseTable.getRowModel().rows"
                  :key="row.id"
                  class="table-row"
                >
                  <td
                    v-for="cell in row.getVisibleCells()"
                    :key="cell.id"
                    class="table-cell"
                  >
                    <div
                      v-if="cell.column.id === 'credits'"
                      class="courses-cell profile-count pill p-grey pill-lg"
                      style="width: fit-content"
                    >
                      {{ cell.renderValue() }}
                    </div>
                    <div
                      v-else-if="cell.column.id === 'enrolledStudents'"
                      class="courses-cell profile-count pill p-grey pill-lg"
                      style="width: fit-content"
                    >
                      {{ cell.renderValue() }}
                    </div>
                    <div
                      v-else-if="cell.column.id === 'actions'"
                      class="action-cell"
                    >
                      <button
                        class="action-button delete-button"
                        @click.stop="openRemoveCourseDialog(row.original)"
                      >
                        <IconsTrashIcon />
                      </button>
                    </div>
                    <div v-else>
                      {{ cell.renderValue() }}
                    </div>
                    <!-- <FlexRender
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    /> -->
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mobile-card-view" v-if="activeTab === 'courses'">
          <div
            v-for="course in courseTable.getRowModel().rows"
            :key="course.id"
            class="base-card"
          >
            <div>
              <div class="card-header">
                <h3 class="card-title">{{ course.original.title }}</h3>
                <div class="card-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="openRemoveCourseDialog(course.original)"
                  >
                    <template #icon>
                      <IconsTrashIcon />
                    </template>
                  </Button>
                </div>
              </div>

              <span class="course-code">{{ course.original.code }}</span>
            </div>
            <div class="card-details">
              <div class="detail-item">
                <IconsBookIcon class="detail-icon" />
                <span class="detail-label">Credits</span>
                <span class="detail-value">{{ course.original.credits }}</span>
              </div>
              <div class="detail-item">
                <IconsUsersIcon class="detail-icon" />
                <span class="detail-label">Students:</span>
                <span class="detail-value">
                  {{ course.original.enrolledStudents }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="loadingDetails || loadingStudents || loadingCourses"
          class="loading-state"
        >
          <div class="loading-spinner"></div>
          <p>Loading program data...</p>
        </div>
      </div>
    </div>

    <!-- Modals and Dialogs -->
    <AddProgramModal
      v-model="showEditModal"
      mode="edit"
      :program="program"
      :available-courses="availableCourses"
      :selected-program-courses="programCourses"
      @program-updated="handleProgramUpdated"
    />

    <AddProgramModal
      v-model="showAddCoursesModal"
      mode="addCourses"
      :program="program"
      :available-courses="availableCourses"
      :selected-program-courses="programCourses"
      @courses-added="handleCoursesAdded"
    />

    <Dialog
      v-model="showRemoveCourseDialog"
      title="Remove Course"
      :message="`Are you sure you want to remove '${courseToRemove?.title}' from this program?`"
      variant="danger"
      confirm-button-text="Remove"
      @confirm="confirmRemoveCourse"
    />

    <!-- Add Toast Container here -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import type { ColumnSort } from "@tanstack/vue-table";
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { computed, h, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import AddProgramModal from "~/components/AddProgramModal.vue";
import IconsGraduationCapIcon from "~/components/icons/AcademicCapIcon.vue";
import ArrowLeftIcon from "~/components/icons/ArrowLeftIcon.vue";
import IconsBookIcon from "~/components/icons/BookOpenIcon.vue";
import PencilIcon from "~/components/icons/PencilIcon.vue";
import IconsPlusIcon from "~/components/icons/PlusIcon.vue";
import IconsSearchIcon from "~/components/icons/SearchIcon.vue";
import TrashIcon from "~/components/icons/TrashIcon.vue";
import IconsUsersIcon from "~/components/icons/UsersIcon.vue";
import Button from "~/components/ui/Button.vue";
import Dialog from "~/components/ui/Dialog.vue";
import FormInput from "~/components/ui/FormInput.vue";
import { useToast } from "~/composables/useToast";
import type { ProgramOutput } from "~/types/program";

// Define that this page uses the dashboard layout
definePageMeta({
  layout: "dashboard",
  // middleware: ["auth"],
});

// Get the program ID from the route
const route = useRoute();
const programId = computed(() => route.params.id);

// Types used in this component
interface Program {
  id: number;
  name: string;
  enrolledStudents: number;
  courses: number;
  type: string;
  credits: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  creditsCompleted: string;
  avatar: string;
}

interface Course {
  id: number;
  title: string;
  code: string;
  credits: number;
  enrolledStudents: number;
}

interface ProgramData {
  students: Student[];
  courses: Course[];
  name: string;
  type: string;
  credits: number;
}

// Add loading states and data refs
const program = ref<Program | null>(null);

// Modal and dialog states
const showEditModal = ref(false);
const showAddCoursesModal = ref(false);
const showRemoveCourseDialog = ref(false);
const courseToRemove = ref<Course | null>(null);

// Tab state
const activeTab = ref("students");

// Student Table State
const studentSearchQuery = ref("");
const studentTableState = reactive({
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  sorting: [] as ColumnSort[],
  globalFilter: "",
});

// Course Table State
const courseSearchQuery = ref("");
const courseTableState = reactive({
  pagination: {
    pageIndex: 0,
    pageSize: 6,
  },
  sorting: [] as ColumnSort[],
  globalFilter: "",
});

// Mock student data (replace with API call)
const mockStudentData = ref<Student[]>([]);

// Mock course data (replace with API call)
const mockCourseData = ref<Course[]>([]);
const programCourses = ref<Course[]>([]);
const availableCourses = ref<Course[]>([]);

const allCourses = computed(() => {
  const courses: Course[] = [];
  // Object.values(programData).forEach((data) => {
  //   data.courses.forEach((course) => {
  //     if (!courses.some((c) => c.id === course.id)) {
  //       courses.push(course);
  //     }
  //   });
  // });
  return courses;
});

// Student columns with proper typing
const studentColumnHelper = createColumnHelper<Student>();
const studentColumns = [
  studentColumnHelper.accessor("name", {
    header: "Student Name",
    cell: ({ row }) =>
      h("div", { class: "avatar-cell" }, [
        h("img", {
          src: row.original.avatar,
          class: "avatar",
          alt: row.original.name,
        }),
        row.original.name,
      ]),
  }),
  studentColumnHelper.accessor("email", {
    header: "Email Address",
  }),
  studentColumnHelper.accessor("creditsCompleted", {
    header: "Credits Completed",
  }),
];

// Replace the current studentTable initialization with:
const studentTable = computed(() => {
  return useVueTable({
    data: mockStudentData.value,
    columns: studentColumns,
    state: studentTableState,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
});

// Replace the existing course columns with:
const courseColumnHelper = createColumnHelper<Course>();
const courseColumns = [
  courseColumnHelper.accessor("title", {
    header: "Course Name",
    cell: (props) => props.getValue(),
  }),
  courseColumnHelper.accessor("code", {
    header: "Course Code",
    cell: (props) => props.getValue(),
  }),
  courseColumnHelper.accessor("credits", {
    header: "Credits",
    cell: (props) => props.getValue(),
  }),
  courseColumnHelper.accessor("enrolledStudents", {
    header: "Enrolled Students",
    cell: (props) => props.getValue(),
  }),

  courseColumnHelper.display({
    id: "actions",
    header: "Action",
    cell: ({ row }) =>
      h("div", { class: "action-cell" }, [
        h(
          "button",
          {
            class: "action-button",
            onClick: () => openRemoveCourseDialog(row.original),
          },
          [h(TrashIcon)]
        ),
      ]),
  }),
];

// Update the courseTable initialization
const courseTable = computed(() => {
  return useVueTable({
    data: mockCourseData.value,
    columns: courseColumns,
    state: courseTableState,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
});

// Get toast instance
const toast = useToast();

const id = parseInt(route.params.id as string);

const {
  call: fetchProgramDetails,
  isLoading: loadingDetails,
  data: programDetailsData,
} = useBackendService(`/programs/${id}`, "get");

const {
  call: fetchStudents,
  isLoading: loadingStudents,
  data: studentsData,
} = useBackendService(`/programs/${id}/students`, "get");

const {
  call: fetchCourses,
  isLoading: loadingCourses,
  data: coursesData,
} = useBackendService(`/programs/${id}/courses`, "get");

onMounted(async () => {
  try {
    await Promise.all([fetchProgramDetails(), fetchStudents(), fetchCourses()]);

    const details = {
      id: programDetailsData.value.program_id,
      name: programDetailsData.value.program_name,
      type:
        programDetailsData.value.program_type.charAt(0) +
        programDetailsData.value.program_type.slice(1).toLowerCase(),
      credits: programDetailsData.value.total_credits,
    };
    const students = studentsData.value.map((student: any) => ({
      id: student.student_id,
      name: `${student.first_name} ${student.last_name}`,
      email: student.email,
      creditsCompleted: `${student.totalCredits}/${programDetailsData.value.total_credits}`,
      avatar: student.profile_picture,
    }));
    const courses = coursesData.value.map((student: any) => ({
      id: student.course_id,
      title: student.course_title,
      code: student.course_code,
      credits: student.course_credits,
      enrolledStudents: student.total_enrollments,
    }));

    program.value = {
      id,
      name: details.name,
      enrolledStudents: students.length,
      courses: courses.length,
      type: details.type,
      credits: details.credits,
    };

    mockStudentData.value = students;
    mockCourseData.value = courses;
    programCourses.value = [...courses];

    availableCourses.value = allCourses.value.filter(
      (course) => !programCourses.value.some((c) => c.id === course.id)
    );
  } catch (error) {
    console.error("Error loading program data:", error);
  }
});

// Modal and dialog handlers
const openEditModal = () => {
  showEditModal.value = true;
};

const openAddCoursesModal = () => {
  showAddCoursesModal.value = true;
};

const openRemoveCourseDialog = (course: Course) => {
  courseToRemove.value = course;
  showRemoveCourseDialog.value = true;
};

const handleProgramUpdated = (updatedProgram: ProgramOutput) => {
  if (program.value) {
    program.value = {
      ...program.value,
      name: updatedProgram.name,
      type: updatedProgram.type,
      credits: updatedProgram.credits,
    };
  }
  toast.success("Program updated successfully");
};

const handleCoursesAdded = (courses: Course[]) => {
  programCourses.value = [...programCourses.value, ...courses];
  mockCourseData.value = [...programCourses.value];

  if (program.value) {
    program.value.courses = programCourses.value.length;
  }

  availableCourses.value = availableCourses.value.filter(
    (c) => !courses.some((newCourse) => newCourse.id === c.id)
  );

  toast.success(`${courses.length} courses added to program`);
};

const confirmRemoveCourse = async () => {
  if (!courseToRemove.value) return;
  const courseId = courseToRemove.value.id;
  const {
    call: deleteCourse,
    isLoading: loadingStudents,
    data: studentsData,
  } = useBackendService(`/programs/${id}/courses/${courseId}`, "Delete");

  try {
    // Simulate API call
    await deleteCourse();

    // Remove the course from the program

    programCourses.value = programCourses.value.filter(
      (c) => c.id !== courseId
    );
    mockCourseData.value = [...programCourses.value];

    // Update the program object with new course count
    if (program.value) {
      program.value.courses = programCourses.value.length;
    }

    // Add the removed course back to available courses
    if (!availableCourses.value.some((c) => c.id === courseId)) {
      const course = allCourses.value.find((c) => c.id === courseId);
      if (course) {
        availableCourses.value.push(course);
      }
    }

    toast.success(`Course removed from program`);
    courseToRemove.value = null;
  } catch (error) {
    console.error("Error removing course:", error);
    toast.error("Failed to remove course");
  }
};

// Navigation methods
const navigateBack = () => {
  navigateTo("/admin/programs");
};

// Add this computed property
const searchQuery = computed({
  get: () =>
    activeTab.value === "students"
      ? studentSearchQuery.value
      : courseSearchQuery.value,
  set: (value) => {
    if (activeTab.value === "students") {
      studentSearchQuery.value = value;
    } else {
      courseSearchQuery.value = value;
    }
  },
});

const calculateCreditProgress = (creditsCompleted: string) => {
  const [completed, total] = creditsCompleted.split("/").map(Number);
  return `${((completed / total) * 100).toFixed(2)}%`;
};
</script>

<style lang="scss" scoped>
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
  background-color: $primary-color-25;

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
    justify-content: space-between;

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

.tab-content {
  margin-bottom: $spacing-4;
}

// Pagination
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: $spacing-4;

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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid $gray-200;
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
}

.mobile-card-view {
  display: none;
  padding: $spacing-4;
  gap: $spacing-4;
  flex-direction: column;

  .base-card {
    background: $gray-25;
    border: 1px solid $gray-200;
    border-radius: 16px;
    padding: $spacing-6;
    display: flex;
    flex-direction: column;
    gap: $spacing-4;
    // box-shadow: rgba(149, 157, 165, 0.1) 0px 8px 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      :deep(.base-button) {
        width: 40px;
        height: 40px;
        border-radius: 100px;

        .button-icon {
          margin: 0;
        }
      }
    }

    .card-title {
      font-size: $text-base;
      margin-bottom: $spacing-1;
    }

    .card-details {
      display: flex;
      gap: $spacing-5;

      .detail-item {
        display: flex;
        align-items: center;
        gap: $spacing-2;
        border-bottom: 1px solid $gray-100;

        .detail-icon {
          width: 20px;
          height: 20px;
          color: $gray-700;
        }

        .detail-label {
          color: $gray-600;
          font-size: $text-sm;
        }

        .detail-value {
          font-weight: 600;
        }
      }
    }

    .card-header-avatar {
      display: flex;
      align-items: center;
      gap: $spacing-3;

      .avatar-info {
        .avatar-name {
          font-size: $text-base;
          margin-bottom: 2px;
        }

        .avatar-email {
          color: $gray-600;
          font-size: $text-sm;
        }
      }
    }
    .card-progress {
      display: flex;
      flex-direction: column;
      gap: $spacing-2;
    }

    .progress-container {
      width: 100%;
      height: 12px;
      padding: 2px;
      border-radius: 100px;
      display: flex;
      align-items: center;
      background-color: $gray-200;

      overflow: hidden;

      .progress-bar {
        height: 100%;
        background-color: $primary-color-500;
        transition: width 0.5s ease-in-out;
        border-radius: 100px;
      }
    }
  }
}

// Add responsive styles
@media (max-width: 768px) {
  .table-container {
    display: none;
  }

  .mobile-card-view {
    display: flex;
  }

  .tab-content {
    margin-bottom: 0 !important;
  }

  .overview-stats {
    flex-wrap: wrap;
    row-gap: 28px;
    column-gap: 0 !important;

    .stat-card {
      width: 50%;
    }
  }
}
</style>
