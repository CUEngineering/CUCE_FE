<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="onOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="modal">
            <div class="modal-header">
              <div class="header-content">
                <h2 class="modal-title">{{ modalTitle }}</h2>
              </div>
              <button class="close-button" @click="close" aria-label="Close">
                <CloseCircleIcon />
              </button>
            </div>

            <div class="modal-body">
              <div class="form-section">
                <!-- Program details section - show only in add/edit mode -->
                <template v-if="mode !== 'addCourses'">
                  <div class="form-field">
                    <label for="program-type" class="form-label"
                      >Program Type</label
                    >
                    <div class="radio-group">
                      <div
                        v-for="option in programTypes"
                        :key="option"
                        class="radio-option"
                        :class="{ selected: form.data.type === option }"
                        @click="form.data.type = option"
                      >
                        <div class="radio">
                          <div
                            v-if="form.data.type === option"
                            class="radio-indicator"
                          ></div>
                        </div>
                        <span class="radio-label">{{ option }}</span>
                      </div>
                    </div>
                    <p v-if="form.errors.type" class="input-error">
                      {{ form.errors.type }}
                    </p>
                  </div>

                  <FormInput
                    id="program-name"
                    label="Program Name"
                    v-model="form.data.name"
                    placeholder="Enter program name"
                    required
                    :error="form.errors.name"
                  />

                  <FormInput
                    id="credits"
                    label="Total Credits"
                    v-model="form.data.credits"
                    type="number"
                    placeholder="0"
                    :error="form.errors.credits"
                  />
                </template>

                <!-- Courses selection - always show for add mode, and addCourses mode -->
                <div
                  class="form-field"
                  v-if="mode === 'add' || mode === 'addCourses'"
                >
                  <label for="courses" class="form-label">Courses</label>

                  <!-- Course tags display -->
                  <div class="course-tags" v-if="selectedCourses.length > 0">
                    <div
                      v-for="(course, index) in selectedCourses"
                      :key="course.id"
                      class="course-tag"
                    >
                      <span class="course-text">{{
                        formatCourseDisplay(course)
                      }}</span>
                      <button
                        class="remove-tag"
                        @click="removeCourse(index)"
                        aria-label="Remove course"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 3L3 9M3 3L9 9"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Course selection dropdown -->
                  <div class="course-dropdown-container">
                    <FormInput
                      id="course-search"
                      ref="courseInput"
                      :label="selectedCourses.length > 0 ? '' : 'Courses'"
                      v-model="courseSearchQuery"
                      :error="courseError"
                      placeholder="Search for courses"
                      @focus="isDropdownOpen = true"
                      @blur="handleBlur"
                      @input="handleCourseSearch"
                    >
                      <template #button>
                        <div class="dropdown-icon" @click="toggleDropdown">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4 6L8 10L12 6"
                              stroke="currentColor"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                      </template>
                    </FormInput>

                    <!-- Dropdown list -->
                    <div v-if="isDropdownOpen" class="course-dropdown">
                      <div
                        v-for="course in filteredCourses"
                        :key="course.id"
                        class="course-option"
                        :class="{ selected: isCourseSelected(course) }"
                        @mousedown.prevent="selectCourse(course)"
                      >
                        <div class="course-option-content">
                          <div class="course-name">{{ course.title }}</div>
                          <div class="course-code">{{ course.code }}</div>
                        </div>
                        <div class="course-credits">
                          {{ course.credits }} credits
                        </div>
                      </div>
                      <div
                        v-if="filteredCourses.length === 0"
                        class="no-results"
                      >
                        No courses found
                      </div>
                    </div>
                  </div>
                  <p v-if="!courseError && mode === 'add'" class="input-hint">
                    Select courses to include in this program
                  </p>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <Button variant="secondary" @click="close"> Cancel </Button>
              <Button
                variant="primary"
                :disabled="isLoading || !canSubmit"
                :loading="isLoading"
                @click="handleSubmit"
              >
                {{ submitButtonText }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick, onMounted } from "vue";
import Button from "./ui/Button.vue";
import CloseCircleIcon from "./icons/CloseCircleIcon.vue";
import FormInput from "./ui/FormInput.vue";
import { useToast } from "~/composables/useToast";

// Define the types here since we don't have access to the existing type file
interface ProgramOutput {
  id: number;
  name: string;
  type: string;
  credits: number;
  courses?: number;
  enrolledStudents?: number;
}

interface Course {
  id: number;
  title: string;
  code: string;
  credits: number;
  enrolledStudents: number;
}

interface Program {
  name: string;
  type: string;
  credits: string;
}

interface Errors {
  name?: string;
  type?: string;
  credits?: string;
}

interface Props {
  modelValue: boolean;
  loading?: boolean;
  persistent?: boolean;
  mode?: "add" | "edit" | "addCourses";
  program?: ProgramOutput | null;
  availableCourses?: Course[];
  selectedProgramCourses?: Course[];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  persistent: false,
  mode: "add",
  program: null,
  availableCourses: () => [],
  selectedProgramCourses: () => [],
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "program-added", program: ProgramOutput): void;
  (e: "program-updated", program: ProgramOutput): void;
  (e: "courses-added", courses: Course[]): void;
}>();

const isLoading = ref(false);
const programTypes = ["Undergraduate", "Masters", "Doctorate"];
const toast = useToast();

// Course selection state
const selectedCourses = ref<Course[]>([]);
const courseSearchQuery = ref("");
const courseError = ref<string | undefined>(undefined);
const isDropdownOpen = ref(false);
const courseInput = ref<typeof FormInput | null>(null);

// Form state
const form = reactive<{
  data: Program;
  errors: Errors;
}>({
  data: {
    name: "",
    type: "",
    credits: "0",
  },
  errors: {},
});

// Computed properties
const modalTitle = computed(() => {
  switch (props.mode) {
    case "edit":
      return "Edit Program";
    case "addCourses":
      return "Add Courses to Program";
    case "add":
    default:
      return "Program Details";
  }
});

const submitButtonText = computed(() => {
  switch (props.mode) {
    case "edit":
      return "Save Changes";
    case "addCourses":
      return "Add Courses";
    case "add":
    default:
      return "Create Program";
  }
});

const filteredCourses = computed(() => {
  let courses = [...props.availableCourses];

  // Filter already selected courses
  const selectedIds = selectedCourses.value.map((c) => c.id);
  courses = courses.filter((c) => !selectedIds.includes(c.id));

  // Apply search filter
  if (courseSearchQuery.value.trim()) {
    const query = courseSearchQuery.value.toLowerCase();
    courses = courses.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query)
    );
  }

  return courses;
});

const canSubmit = computed(() => {
  if (props.mode === "add") {
    return form.data.name && form.data.type;
  } else if (props.mode === "edit") {
    return form.data.name && form.data.type;
  } else if (props.mode === "addCourses") {
    return selectedCourses.value.length > 0;
  }
  return false;
});

// Course selection methods
const handleCourseSearch = () => {
  // Open dropdown when typing
  isDropdownOpen.value = true;
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value) {
    nextTick(() => {
      courseInput.value?.focus();
    });
  }
};

const handleBlur = () => {
  // Delay closing to allow for click on dropdown items
  setTimeout(() => {
    isDropdownOpen.value = false;
  }, 150);
};

const isCourseSelected = (course: Course) => {
  return selectedCourses.value.some((c) => c.id === course.id);
};

const selectCourse = (course: Course) => {
  if (!isCourseSelected(course)) {
    selectedCourses.value.push(course);
    courseSearchQuery.value = "";
  }
};

const removeCourse = (index: number) => {
  selectedCourses.value.splice(index, 1);
};

const formatCourseDisplay = (course: Course): string => {
  return `${course.code} - ${course.title}`;
};

// Form validation
const validateForm = (): boolean => {
  form.errors = {};

  if (props.mode !== "addCourses") {
    form.errors.name = !form.data.name ? "Program name is required" : undefined;
    form.errors.type = !form.data.type ? "Program type is required" : undefined;
  }

  return !Object.values(form.errors).some((error) => error !== undefined);
};

// Submit handler
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;

  try {
    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (props.mode === "add") {
      // Create new program
      const newProgram: ProgramOutput = {
        id: Math.floor(Math.random() * 1000),
        name: form.data.name,
        type: form.data.type,
        credits: Number(form.data.credits),
        courses: selectedCourses.value.length,
      };

      emit("program-added", newProgram);
      toast.success(`Program "${form.data.name}" added successfully`);
    } else if (props.mode === "edit" && props.program) {
      // Update existing program
      const updatedProgram: ProgramOutput = {
        ...props.program,
        name: form.data.name,
        type: form.data.type,
        credits: Number(form.data.credits),
      };

      emit("program-updated", updatedProgram);
      toast.success(`Program "${form.data.name}" updated successfully`);
    } else if (props.mode === "addCourses") {
      // Add courses to existing program
      emit("courses-added", selectedCourses.value);
      toast.success(`${selectedCourses.value.length} courses added to program`);
    }

    close();
  } catch (error) {
    console.error("Error processing program:", error);
    toast.error(`Failed to ${props.mode} program. Please try again.`);
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  form.data = {
    name: "",
    type: "",
    credits: "0",
  };
  form.errors = {};
  selectedCourses.value = [];
  courseSearchQuery.value = "";
  courseError.value = undefined;
};

const close = () => {
  emit("update:modelValue", false);
};

const onOverlayClick = () => {
  if (!props.persistent && !isLoading.value) {
    close();
  }
};

// Initialize form with program data when editing
const initializeForm = () => {
  if (props.mode === "edit" && props.program) {
    form.data.name = props.program.name;
    form.data.type = props.program.type;
    form.data.credits = String(props.program.credits);
  }

  if (props.mode === "addCourses" || props.mode === "edit") {
    selectedCourses.value = [...props.selectedProgramCourses];
  }
};

// Initialize on mount and when props change
onMounted(initializeForm);

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      initializeForm();
    } else {
      resetForm();
    }
  }
);

watch(
  () => props.program,
  () => {
    if (props.modelValue) {
      initializeForm();
    }
  }
);
</script>

<style lang="scss" scoped>
.modal-body {
  .form-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .course-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    margin-bottom: 8px;
  }

  .course-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px 4px 10px;
    background-color: $primary-color-50;
    border: 1px solid $primary-color-200;
    border-radius: 20px;
    font-size: $text-sm;
    font-family: $font-family;
    font-weight: 500;

    .course-text {
      color: $primary-color-700;
    }

    .remove-tag {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: $primary-color-400;
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover {
        color: $primary-color-700;
        background-color: rgba($primary-color, 0.1);
      }

      svg {
        width: 14px;
        height: 14px;
      }
    }
  }

  .course-dropdown-container {
    position: relative;
    width: 100%;
  }

  .dropdown-icon {
    cursor: pointer;
  }

  .course-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    max-height: 240px;
    overflow-y: auto;
    background-color: $white;
    border: 1px solid $gray-200;
    border-radius: 8px;
    margin-top: 4px;
    z-index: 10;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  }

  .course-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    cursor: pointer;

    &:hover {
      background-color: $gray-50;
    }

    &.selected {
      background-color: $primary-color-50;
    }

    .course-option-content {
      display: flex;
      flex-direction: column;
    }

    .course-name {
      font-weight: 500;
      color: $gray-900;
    }

    .course-code {
      font-size: $text-sm;
      color: $gray-600;
    }

    .course-credits {
      font-size: $text-sm;
      color: $gray-700;
    }
  }

  .no-results {
    padding: 16px;
    text-align: center;
    color: $gray-600;
  }

  .input-hint {
    font-size: $text-sm;
    color: $gray-600;
    margin-top: -12px;
  }
}
</style>
