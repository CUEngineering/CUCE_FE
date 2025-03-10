<template>
  <div class="program-detail-page">
    <!-- Debugging info -->
    <div v-if="!program" class="debugging-info">
      <p>Loading program with ID: {{ programId }}</p>
      <p>Route params: {{ JSON.stringify(route.params) }}</p>
    </div>

    <!-- Back button header -->
    <div class="page-header">
      <button class="back-button" @click="navigateBack">
        <span class="back-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.8334 10H4.16669M4.16669 10L10.0001 15.8333M4.16669 10L10.0001 4.16667"
              stroke="currentColor"
              stroke-width="1.66667"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        Program Details
      </button>
      <div class="header-actions">
        <Button variant="outline">
          <template #icon>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 16.6667H17.5M13.75 2.91667C14.0815 2.58515 14.5312 2.39844 15 2.39844C15.4688 2.39844 15.9185 2.58515 16.25 2.91667C16.5815 3.24819 16.7682 3.69785 16.7682 4.16667C16.7682 4.63549 16.5815 5.08515 16.25 5.41667L5.83333 15.8333L2.5 16.6667L3.33333 13.3333L13.75 2.91667Z"
                stroke="currentColor"
                stroke-width="1.66667"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </template>
          Edit
        </Button>
      </div>
    </div>

    <!-- Program overview -->
    <div v-if="program" class="program-overview">
      <div class="overview-header">
        <h1 class="program-title">{{ program.name }}</h1>
        <span :class="['program-type', program.type.toLowerCase()]">
          {{ program.type }}
        </span>
      </div>

      <div class="overview-stats">
        <div class="stat-card">
          <div class="stat-value">{{ program.enrolledStudents }}</div>
          <div class="stat-label">Total Students</div>
          <div class="stat-indicator">
            <span class="new-students">+35 new</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ program.courses }}</div>
          <div class="stat-label">Total Courses</div>
          <div class="stat-indicator">
            <span class="core-count">+{{ program.coreCount }} core</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ program.credits }}</div>
          <div class="stat-label">Total Credits</div>
        </div>
      </div>
    </div>

    <!-- Tabs for students/courses -->
    <div class="program-tabs">
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

    <!-- Students tab content -->
    <div v-if="activeTab === 'students'" class="tab-content">
      <!-- Students table -->
      <div class="data-table-container">
        <table class="data-table">
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
                    {{ header.column.getIsSortedDesc() ? "▼" : "▲" }}
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

    <!-- Courses tab content -->
    <div v-if="activeTab === 'courses'" class="tab-content">
      <!-- Courses table -->
      <div class="data-table-container">
        <table class="data-table">
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
                    {{ header.column.getIsSortedDesc() ? "▼" : "▲" }}
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
                <div v-if="cell.column.id === 'actions'" class="action-cell">
                  <button class="action-button">
                    <DotsVerticalIcon />
                  </button>
                </div>
                <template v-else>
                  <component
                    :is="cell.column.columnDef.cell"
                    :row="cell.row"
                    :value="cell.getValue()"
                  />
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  onMounted,
  h,
  watch,
  defineComponent,
} from "vue";
import { useRoute } from "vue-router";
import {
  createColumnHelper,
  FlexRender,
  useVueTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/vue-table";
import type { ColumnSort } from "@tanstack/vue-table";
import Button from "~/components/ui/Button.vue";
import SearchIcon from "~/components/icons/SearchIcon.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import DotsVerticalIcon from "~/components/icons/DotsVerticalIcon.vue";

// Define that this page uses the dashboard layout
definePageMeta({
  layout: "dashboard",
});

// Get the program ID from the route
const route = useRoute();
const programId = computed(() => route.params.id);

// Add this for debugging - will show in server logs
console.log("Route params:", route.params);

// Add Program interface definition
interface Program {
  id: number;
  name: string;
  enrolledStudents: number;
  courses: number;
  coreCount: number;
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
  duration: string;
  type: string;
}

// Mock data
const mockPrograms: Program[] = [
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
];

// Add loading states and data refs
const isLoading = ref(true);
const program = ref<Program | null>(null);

// Remove separate refs for students and courses since we're using mockData
// const students = ref<Student[]>([]);
// const courses = ref<Course[]>([]);

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
const mockStudentData = ref<Student[]>([
  {
    id: 1,
    name: "Lana Steiner",
    email: "lanasteiner@charismauniversity.edu.eu",
    creditsCompleted: "64/104",
    avatar: "/images/avatars/avatar-1.png",
  },
  {
    id: 2,
    name: "Benjamin Cole",
    email: "benjamincole@charismauniversity.edu.eu",
    creditsCompleted: "72/96",
    avatar: "/images/avatars/avatar-2.png",
  },
  {
    id: 3,
    name: "Fortune Cole",
    email: "fortunecole@charismauniversity.edu.eu",
    creditsCompleted: "100/104",
    avatar: "/images/avatars/avatar-3.png",
  },
  {
    id: 4,
    name: "Phoenix Baker",
    email: "phoenixbaker@charismauniversity.edu.eu",
    creditsCompleted: "46/78",
    avatar: "/images/avatars/avatar-4.png",
  },
  {
    id: 5,
    name: "Olivia Rhye",
    email: "oliviarhye@charismauniversity.edu.eu",
    creditsCompleted: "35/124",
    avatar: "/images/avatars/avatar-5.png",
  },
]);

// Mock course data (replace with API call)
const mockCourseData = ref<Course[]>([
  {
    id: 1,
    title: "Introduction to Psychology",
    code: "PSY101",
    credits: 4,
    duration: "12 weeks",
    type: "Core",
  },
  {
    id: 2,
    title: "Developmental Psychology",
    code: "PSY204",
    credits: 3,
    duration: "10 weeks",
    type: "Core",
  },
  {
    id: 3,
    title: "Cognitive Psychology",
    code: "PSY302",
    credits: 4,
    duration: "12 weeks",
    type: "Core",
  },
  {
    id: 4,
    title: "Social Psychology",
    code: "PSY205",
    credits: 3,
    duration: "10 weeks",
    type: "Elective",
  },
  {
    id: 5,
    title: "Abnormal Psychology",
    code: "PSY303",
    credits: 4,
    duration: "12 weeks",
    type: "Elective",
  },
]);

// Student columns with proper typing
const studentColumnHelper = createColumnHelper<Student>();
const studentColumns = [
  studentColumnHelper.accessor("name", {
    header: "Student Name",
    cell: ({ row }) =>
      h("div", { class: "student-name-cell" }, [
        h("img", {
          src: row.original.avatar,
          class: "student-avatar",
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
  studentColumnHelper.display({
    id: "actions",
    header: "Action",
    cell: () => h(DotsVerticalIcon),
  }),
];

// Initialize table without computed()
const studentTable = useVueTable({
  data: mockStudentData.value,
  columns: studentColumns,
  state: studentTableState,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
});

// Configure course columns
const courseColumns = [
  {
    id: "title",
    header: "Course Name",
    accessorKey: "title",
    cell: defineComponent({
      props: ["value"],
      setup(props) {
        return () => h("span", {}, props.value);
      },
    }),
  },
  {
    id: "code",
    header: "Course Code",
    accessorKey: "code",
    cell: defineComponent({
      props: ["value"],
      setup(props) {
        return () => h("span", {}, props.value);
      },
    }),
  },
  {
    id: "credits",
    header: "Credits",
    accessorKey: "credits",
    cell: defineComponent({
      props: ["value"],
      setup(props) {
        return () => h("span", {}, props.value);
      },
    }),
  },
  {
    id: "duration",
    header: "Duration",
    accessorKey: "duration",
    cell: defineComponent({
      props: ["value"],
      setup(props) {
        return () => h("span", {}, props.value);
      },
    }),
  },
  {
    id: "type",
    header: "Type",
    accessorKey: "type",
    cell: defineComponent({
      props: ["row", "value"],
      setup(props) {
        return () =>
          h(
            "span",
            { class: ["course-type", props.value.toLowerCase()] },
            props.value
          );
      },
    }),
  },
  {
    id: "actions",
    header: "Action",
    cell: defineComponent({
      setup() {
        return () =>
          h(
            "button",
            {
              onClick: (e: Event) => {
                e.stopPropagation();
                // Action logic here
              },
              class: "action-button",
            },
            h(DotsVerticalIcon)
          );
      },
    }),
  },
] as const;

// Initialize tables
const courseTable = computed(() => {
  return useVueTable({
    data: mockCourseData.value,
    columns: courseColumns as any,
    state: courseTableState,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
});

// Fetch program details
onMounted(() => {
  // Set program data
  const id = parseInt(route.params.id as string, 10);
  program.value = mockPrograms.find((p) => p.id === id) || null;

  // We have mock data, no need to load
  isLoading.value = false;
});

// Navigation methods
const navigateBack = () => {
  navigateTo("/programs");
};
</script>

<style lang="scss" scoped>
.program-detail-page {
  padding: $spacing-6;
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-6;

  .back-button {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    background: none;
    border: none;
    font-family: $font-family-heading;
    font-size: $text-xl;
    font-weight: 600;
    color: $gray-900;
    cursor: pointer;
    padding: 0;

    .back-icon {
      width: 20px;
      height: 20px;
    }
  }

  .header-actions {
    display: flex;
    gap: $spacing-4;
  }
}

.program-overview {
  background-color: $white;
  border-radius: 16px;
  border: 1px solid $gray-200;
  padding: $spacing-6;
  margin-bottom: $spacing-6;

  .overview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-6;
    flex-wrap: wrap;
    gap: $spacing-4;

    .program-title {
      font-family: $font-family-heading;
      font-size: $text-2xl;
      font-weight: 700;
      color: $gray-900;
      margin: 0;
    }

    .program-type {
      padding: 6px $spacing-4;
      border-radius: 16px;
      font-size: $text-sm;
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

  .overview-stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: $spacing-6;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: $spacing-1;

    .stat-value {
      font-size: $text-3xl;
      font-weight: 700;
      color: $gray-900;
    }

    .stat-label {
      font-size: $text-sm;
      color: $gray-600;
    }

    .stat-indicator {
      margin-top: $spacing-1;

      .new-students {
        display: inline-block;
        padding: 2px $spacing-2;
        border-radius: 4px;
        font-size: $text-xs;
        font-weight: 500;
        background-color: $success-50;
        color: $success-500;
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
}

.program-tabs {
  display: flex;
  gap: $spacing-2;
  margin-bottom: $spacing-6;
  border-bottom: 1px solid $gray-200;

  .tab-button {
    padding: $spacing-3 $spacing-4;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: $gray-600;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: $gray-900;
    }

    &.active {
      color: $primary-color;
      border-bottom: 2px solid $primary-color;
    }
  }
}

.tab-content {
  margin-bottom: $spacing-6;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-4;
  flex-wrap: wrap;
  gap: $spacing-4;

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

// Table styles
.data-table-container {
  background-color: $white;
  border-radius: 16px;
  border: 1px solid $gray-200;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: $spacing-4;
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  .table-header {
    padding: $spacing-4;
    text-align: left;
    color: $gray-700;
    font-weight: 600;
    font-size: $text-sm;
    background-color: $gray-50;
    border-bottom: 1px solid $gray-200;
    position: relative;
    cursor: pointer;

    .header-content {
      display: flex;
      align-items: center;
      gap: $spacing-2;
    }

    .sort-indicator {
      display: inline-block;
      color: $primary-color;
      font-size: $text-sm;
    }

    &:last-child {
      text-align: center;
    }
  }

  .table-row {
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:nth-child(even) {
      background-color: $gray-50;
    }

    &:hover {
      background-color: $primary-color-25;
    }
  }

  .table-cell {
    padding: $spacing-4;
    text-align: left;
    border-bottom: 1px solid $gray-200;
    font-size: $text-sm;
    color: $gray-800;

    &:last-child {
      text-align: center;
    }
  }
}

.student-name-cell {
  display: flex;
  align-items: center;
  gap: $spacing-3;

  .student-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }
}

.course-type {
  display: inline-block;
  padding: 4px $spacing-3;
  border-radius: 16px;
  font-size: $text-xs;
  font-weight: 500;

  &.core {
    background-color: $primary-color-50;
    color: $primary-color-700;
  }

  &.elective {
    background-color: $gray-100;
    color: $gray-700;
  }
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  color: $gray-500;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin: 0 auto;

  &:hover {
    background-color: $gray-100;
    color: $gray-700;
  }
}

.action-cell {
  display: flex;
  justify-content: center;
  align-items: center;
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
  justify-content: center;
  align-items: center;
  padding: $spacing-6;
  background-color: $white;
  border-radius: 16px;
  border: 1px solid $gray-200;
  color: $gray-600;
  font-size: $text-sm;
}
</style>
