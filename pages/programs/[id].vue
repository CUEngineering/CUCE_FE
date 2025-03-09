<template>
  <div class="program-detail-page">
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
        Programme Details
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
            <span class="new-students"
              >+{{ program.newStudents || 35 }} new</span
            >
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ program.totalCourses || 24 }}</div>
          <div class="stat-label">Total Courses</div>
          <div class="stat-indicator">
            <span class="core-count">+{{ program.coreCount || 14 }} core</span>
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
      <div class="tab-header">
        <div class="search-container">
          <input
            type="text"
            class="search-input"
            placeholder="Search students"
            v-model="studentSearchQuery"
          />
          <SearchIcon class="search-icon" />
        </div>
        <Button>
          <template #icon>
            <PlusIcon />
          </template>
          Add Student
        </Button>
      </div>

      <!-- Desktop: Students table -->
      <div class="desktop-view">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Email Address</th>
              <th>Credits Completed</th>
              <th class="action-column">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in filteredStudents" :key="student.id">
              <td class="student-name-cell">
                <img
                  :src="student.avatar"
                  :alt="student.name"
                  class="student-avatar"
                />
                <span>{{ student.name }}</span>
              </td>
              <td>{{ student.email }}</td>
              <td>{{ student.creditsCompleted }}</td>
              <td class="action-column">
                <button class="action-button">
                  <DotsVerticalIcon />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile: Students cards -->
      <div class="mobile-view">
        <div
          v-for="student in filteredStudents"
          :key="student.id"
          class="student-card"
        >
          <div class="student-card-header">
            <div class="student-info">
              <img
                :src="student.avatar"
                :alt="student.name"
                class="student-avatar"
              />
              <div>
                <h3 class="student-name">{{ student.name }}</h3>
                <p class="student-email">{{ student.email }}</p>
              </div>
            </div>
            <button class="action-button">
              <DotsVerticalIcon />
            </button>
          </div>
          <div class="student-card-content">
            <div class="student-stat">
              <span class="stat-label">Credits Completed</span>
              <span class="stat-value">{{ student.creditsCompleted }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button class="pagination-button" :disabled="currentPage === 1">
          Previous
        </button>
        <div class="pagination-pages">
          <button
            v-for="page in totalPages"
            :key="page"
            class="page-number"
            :class="{ active: currentPage === page }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
        </div>
        <button
          class="pagination-button"
          :disabled="currentPage === totalPages"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Courses tab content -->
    <div v-if="activeTab === 'courses'" class="tab-content">
      <div class="tab-header">
        <div class="search-container">
          <input
            type="text"
            class="search-input"
            placeholder="Search courses"
            v-model="courseSearchQuery"
          />
          <SearchIcon class="search-icon" />
        </div>
        <Button>
          <template #icon>
            <PlusIcon />
          </template>
          Add Course
        </Button>
      </div>

      <!-- Courses list -->
      <div class="courses-list">
        <div
          v-for="course in filteredCourses"
          :key="course.id"
          class="course-card"
        >
          <div class="course-card-header">
            <h3 class="course-title">{{ course.title }}</h3>
            <span :class="['course-type', course.type.toLowerCase()]">{{
              course.type
            }}</span>
          </div>
          <div class="course-card-content">
            <div class="course-stats">
              <div class="course-stat">
                <span class="stat-label">Course Code</span>
                <span class="stat-value">{{ course.code }}</span>
              </div>
              <div class="course-stat">
                <span class="stat-label">Credits</span>
                <span class="stat-value">{{ course.credits }}</span>
              </div>
              <div class="course-stat">
                <span class="stat-label">Duration</span>
                <span class="stat-value">{{ course.duration }}</span>
              </div>
            </div>
            <button class="action-button">
              <DotsVerticalIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
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

// Mock program data (replace with API call)
const program = ref<{
  id: number;
  name: string;
  type: string;
  enrolledStudents: number;
  newStudents?: number;
  totalCourses?: number;
  coreCount?: number;
  credits: number;
} | null>(null);

// Tab state
const activeTab = ref("students");
const currentPage = ref(1);
const pageSize = 10;
const studentSearchQuery = ref("");
const courseSearchQuery = ref("");

// Mock student data (replace with API call)
const students = ref([
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
const courses = ref([
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

// Fetch program details
onMounted(async () => {
  // Mock API call
  program.value = {
    id: Number(programId.value),
    name: "Electrical Electronics & Computer Engineering",
    type: "Undergraduate",
    enrolledStudents: 64,
    newStudents: 35,
    totalCourses: 24,
    coreCount: 14,
    credits: 164,
  };
});

// Filter students by search query
const filteredStudents = computed(() => {
  if (!studentSearchQuery.value) return students.value;

  const query = studentSearchQuery.value.toLowerCase();
  return students.value.filter(
    (student) =>
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
  );
});

// Filter courses by search query
const filteredCourses = computed(() => {
  if (!courseSearchQuery.value) return courses.value;

  const query = courseSearchQuery.value.toLowerCase();
  return courses.value.filter(
    (course) =>
      course.title.toLowerCase().includes(query) ||
      course.code.toLowerCase().includes(query)
  );
});

// Total pages for pagination
const totalPages = computed(() => {
  return Math.ceil(filteredStudents.value.length / pageSize);
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

// Desktop table styles
.desktop-view {
  width: 100%;
  overflow-x: auto;
  display: block;

  @media (max-width: $breakpoint-md) {
    display: none;
  }
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: $white;
  border-radius: 16px;
  border: 1px solid $gray-200;
  overflow: hidden;

  th,
  td {
    padding: $spacing-4;
    text-align: left;
    border-bottom: 1px solid $gray-200;
    font-size: $text-sm;
  }

  th {
    color: $gray-700;
    font-weight: 600;
    background-color: $gray-50;
    white-space: nowrap;
  }

  .student-name-cell {
    display: flex;
    align-items: center;
    gap: $spacing-3;
  }

  .student-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }

  .action-column {
    width: 60px;
    text-align: center;
  }

  .action-button {
    background: none;
    border: none;
    cursor: pointer;
    color: $gray-500;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
      background-color: $gray-100;
      color: $gray-700;
    }
  }
}

// Mobile styles
.mobile-view {
  display: none;

  @media (max-width: $breakpoint-md) {
    display: block;
  }
}

.student-card {
  padding: $spacing-4;
  background-color: $white;
  border: 1px solid $gray-200;
  border-radius: 12px;
  margin-bottom: $spacing-3;

  .student-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-3;

    .student-info {
      display: flex;
      align-items: center;
      gap: $spacing-3;

      .student-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
      }

      .student-name {
        font-weight: 600;
        font-size: $text-base;
        color: $gray-800;
        margin: 0;
      }

      .student-email {
        font-size: $text-sm;
        color: $gray-600;
        margin: 0;
      }
    }
  }

  .student-card-content {
    .student-stat {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .stat-label {
        font-size: $text-sm;
        color: $gray-600;
      }

      .stat-value {
        font-weight: 500;
        color: $gray-900;
      }
    }
  }
}

// Course cards
.courses-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $spacing-4;

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}

.course-card {
  background-color: $white;
  border: 1px solid $gray-200;
  border-radius: 12px;
  overflow: hidden;

  .course-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-4;
    border-bottom: 1px solid $gray-200;

    .course-title {
      font-weight: 600;
      font-size: $text-base;
      color: $gray-800;
      margin: 0;
    }

    .course-type {
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
  }

  .course-card-content {
    padding: $spacing-4;
    display: flex;
    justify-content: space-between;

    .course-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: $spacing-4;

      @media (max-width: $breakpoint-sm) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .course-stat {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .stat-label {
        font-size: $text-xs;
        color: $gray-500;
      }

      .stat-value {
        font-weight: 500;
        color: $gray-800;
      }
    }
  }
}

// Pagination
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-4;
  margin-top: $spacing-4;

  .pagination-button {
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
  }

  .page-number {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: none;
    background: none;
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
</style>
