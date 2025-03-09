<template>
  <div class="programs-page">
    <div class="page-header">
      <h1>Programmes</h1>
      <div class="search-and-actions">
        <div class="search-container">
          <input
            type="text"
            class="search-input"
            placeholder="Find a programme"
            v-model="searchQuery"
          />
          <SearchIcon class="search-icon" />
        </div>
        <Button @click="openAddProgramModal">
          <template #icon>
            <PlusIcon />
          </template>
          New Programme
        </Button>
      </div>
    </div>

    <!-- Empty state for when no programs exist -->
    <EmptyState
      v-if="!programs.length"
      title="No programmes found"
      description="Add your first programme to get started"
    >
      <template #icon>
        <DocumentIcon />
      </template>
      <template #action>
        <Button @click="openAddProgramModal">
          <template #icon>
            <PlusIcon />
          </template>
          Add a programme
        </Button>
      </template>
    </EmptyState>

    <!-- Programs list when programs exist -->
    <div v-else class="programs-content">
      <div class="programs-filter">
        <div class="filter-section">
          <span>Available Programs</span>
          <select v-model="filterType" class="filter-select">
            <option value="all">All ({{ programs.length }})</option>
          </select>
        </div>
      </div>

      <!-- Desktop view: Table -->
      <div class="desktop-view">
        <table class="programs-table">
          <thead>
            <tr>
              <th>Programme Name</th>
              <th>Enrolled Students</th>
              <th>
                Courses associated
                <InfoCircleIcon class="info-icon" />
              </th>
              <th>Programme Type</th>
              <th>Credits</th>
              <th class="action-column">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="program in filteredPrograms"
              :key="program.id"
              @click="viewProgramDetails(program.id)"
            >
              <td>{{ program.name }}</td>
              <td>{{ program.enrolledStudents }}</td>
              <td>
                {{ program.courses }}
                <span v-if="program.coreCount" class="core-tag"
                  >+{{ program.coreCount }} core</span
                >
              </td>
              <td>
                <span :class="['program-type', program.type.toLowerCase()]">
                  {{ program.type }}
                </span>
              </td>
              <td>{{ program.credits }}</td>
              <td class="action-column">
                <button class="action-button" @click.stop>
                  <DotsVerticalIcon />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile view: Card list -->
      <div class="mobile-view">
        <div
          v-for="program in filteredPrograms"
          :key="program.id"
          class="program-card"
          @click="viewProgramDetails(program.id)"
        >
          <div class="program-card-header">
            <h3 class="program-name">{{ program.name }}</h3>
            <button class="action-button" @click.stop>
              <DotsVerticalIcon />
            </button>
          </div>
          <div class="program-card-content">
            <div class="program-stat">
              <span class="stat-label">Enrolled Students</span>
              <span class="stat-value">{{ program.enrolledStudents }}</span>
            </div>
            <div class="program-stat">
              <span class="stat-label">Total Courses</span>
              <span class="stat-value">{{ program.courses }}</span>
            </div>
            <div class="program-stat">
              <span class="stat-label">Credits</span>
              <span class="stat-value">{{ program.credits }}</span>
            </div>
            <div class="program-stat">
              <span class="stat-label">Type</span>
              <span :class="['program-type', program.type.toLowerCase()]">
                {{ program.type }}
              </span>
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

    <!-- Add Program Modal -->
    <AddProgramModal
      v-if="showAddProgramModal"
      v-model="showAddProgramModal"
      @program-added="handleProgramAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Button from "~/components/ui/Button.vue";
import EmptyState from "~/components/ui/EmptyState.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import SearchIcon from "~/components/icons/SearchIcon.vue";
import DocumentIcon from "~/components/icons/DocumentIcon.vue";
import DotsVerticalIcon from "~/components/icons/DotsVerticalIcon.vue";
import AddProgramModal from "~/components/AddProgramModal.vue";

interface Program {
  id: number;
  name: string;
  enrolledStudents: number;
  courses: number;
  coreCount: number;
  type: string;
  credits: number;
}

// Mock data - replace with API call in production
const programs = ref<Program[]>([
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
]);

const searchQuery = ref("");
const filterType = ref("all");
const currentPage = ref(1);
const pageSize = 10;
const showAddProgramModal = ref(false);

// Filtered and paginated programs
const filteredPrograms = computed(() => {
  let filtered = programs.value;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((program) =>
      program.name.toLowerCase().includes(query)
    );
  }

  // Apply type filter (if implemented)
  if (filterType.value !== "all") {
    filtered = filtered.filter(
      (program) => program.type.toLowerCase() === filterType.value.toLowerCase()
    );
  }

  return filtered;
});

// Total pages for pagination
const totalPages = computed(() => {
  return Math.ceil(filteredPrograms.value.length / pageSize);
});

// Methods
const openAddProgramModal = () => {
  showAddProgramModal.value = true;
};

const handleProgramAdded = (newProgram: Program) => {
  programs.value.push(newProgram);
  showAddProgramModal.value = false;
};

const viewProgramDetails = (programId: number) => {
  // Navigate to program details page
  navigateTo(`/programs/${programId}`);
};

// Define that this page uses the dashboard layout
definePageMeta({
  layout: "dashboard",
});
</script>

<style lang="scss" scoped>
.programs-page {
  padding: $spacing-6;
  max-width: 100%;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-6;
    flex-wrap: wrap;
    gap: $spacing-4;

    h1 {
      font-family: $font-family-heading;
      font-size: $text-3xl;
      font-weight: 700;
      color: $gray-900;
      margin: 0;
    }

    .search-and-actions {
      display: flex;
      gap: $spacing-4;
      flex-wrap: wrap;
    }

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

  .programs-content {
    background-color: $white;
    border-radius: 16px;
    border: 1px solid $gray-200;
    overflow: hidden;
  }

  .programs-filter {
    padding: $spacing-4;
    border-bottom: 1px solid $gray-200;
    display: flex;
    justify-content: space-between;

    .filter-section {
      display: flex;
      align-items: center;
      gap: $spacing-3;

      span {
        font-weight: 600;
        color: $gray-700;
        font-size: $text-sm;
      }

      .filter-select {
        padding: $spacing-2 $spacing-3;
        border-radius: 8px;
        border: 1px solid $gray-300;
        background-color: $white;
        font-family: $font-family;
        font-size: $text-sm;
        color: $gray-800;

        &:focus {
          outline: none;
          border-color: $primary-color;
        }
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

  .programs-table {
    width: 100%;
    border-collapse: collapse;

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

      .info-icon {
        width: 16px;
        height: 16px;
        margin-left: $spacing-1;
        vertical-align: middle;
        color: $gray-400;
      }
    }

    tbody tr {
      cursor: pointer;

      &:hover {
        background-color: $primary-color-25;
      }
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

    .core-tag {
      display: inline-block;
      margin-left: $spacing-2;
      background-color: $primary-color-100;
      color: $primary-color-700;
      padding: 2px $spacing-2;
      border-radius: 4px;
      font-size: $text-xxs;
      font-weight: 500;
    }

    .program-type {
      padding: 4px $spacing-3;
      border-radius: 16px;
      font-size: $text-xs;
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

  // Mobile card view
  .mobile-view {
    display: none;

    @media (max-width: $breakpoint-md) {
      display: block;
    }
  }

  .program-card {
    padding: $spacing-4;
    border-bottom: 1px solid $gray-200;
    cursor: pointer;

    &:hover {
      background-color: $primary-color-25;
    }

    .program-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-3;

      .program-name {
        font-weight: 600;
        font-size: $text-base;
        color: $gray-800;
        margin: 0;
      }
    }

    .program-card-content {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: $spacing-3;
    }

    .program-stat {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .stat-label {
        font-size: $text-xs;
        color: $gray-500;
      }

      .stat-value {
        font-size: $text-sm;
        color: $gray-800;
        font-weight: 500;
      }
    }

    .program-type {
      display: inline-block;
      padding: 4px $spacing-3;
      border-radius: 16px;
      font-size: $text-xs;
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

  // Pagination
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-4;
    border-top: 1px solid $gray-200;

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
}
</style>
