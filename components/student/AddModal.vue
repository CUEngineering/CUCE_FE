<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="onOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="modal o-visible">
            <div class="modal-header">
              <div class="header-content">
                <h2 class="modal-title">Invite Students</h2>
                <p>
                  Invite students to streamline their support and enhance their
                  academic experience.
                </p>
              </div>
              <button class="close-button" @click="close" aria-label="Close">
                <CloseCircleIcon />
              </button>
            </div>

            <div class="modal-body">
              <div class="form-section">
                <FormInput
                  id="student-id"
                  label="Student ID"
                  v-model="form.data.studentId"
                  placeholder="Enter student ID"
                  required
                  :error="form.errors.studentId"
                />

                <!-- Student Email -->
                <FormInput
                  id="student-email"
                  label="Student Email"
                  v-model="form.data.email"
                  placeholder="Enter student email"
                  type="email"
                  required
                  :error="form.errors.email"
                />

                <div class="form-field">
                  <!-- Course tags display -->
                  <div class="form-tags" v-if="selectedCourse">
                    <div class="form-tag">
                      <span class="tag-text">{{ selectedCourse.name }}</span>
                      <button
                        class="remove-tag"
                        @click="
                          selectedCourse = null;
                          form.data.programId = '';
                        "
                        aria-label="Remove course"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  </div>

                  <!-- Course selection dropdown -->
                  <div
                    class="course-dropdown-container"
                    ref="dropdownContainer"
                  >
                    <FormInput
                      id="course-search"
                      ref="courseInput"
                      :label="'Programs'"
                      v-model="courseSearchQuery"
                      :error="courseError"
                      placeholder="Search for program"
                      @focus="isDropdownOpen = true"
                      @blur="handleBlur"
                      @input="handleCourseSearch"
                    >
                      <template #button>
                        <div class="dropdown-icon" @click="toggleDropdown">
                          <ChevronDownIcon />
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
                          <div class="course-name">{{ course.name }}</div>
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
                Send Invite
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useToast } from "~/composables/useToast";
import type { ProgramOutput } from "~/types/program";
import ChevronDownIcon from "../icons/ChevronDownIcon.vue";
import CloseCircleIcon from "../icons/CloseCircleIcon.vue";
import CloseIcon from "../icons/CloseIcon.vue";
import Button from "../ui/Button.vue";
import FormInput from "../ui/FormInput.vue";

interface Course {
  id: number;
  name: string;
}

interface Props {
  modelValue: boolean;
  loading?: boolean;
  persistent?: boolean;
  program?: ProgramOutput | null;
  availableCourses?: Course[];
  selectedProgramCourses?: Course[];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  persistent: false,
  program: null,

  selectedProgramCourses: () => [],
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "invite-success"): void;
  (e: "invite-failure"): void;
}>();

const isLoading = ref(false);
const toast = useToast();

// Course selection state
const selectedCourse = ref<Course | null>(null);
const courseSearchQuery = ref("");
const courseError = ref<string | undefined>(undefined);
const isDropdownOpen = ref(false);
const courseInput = ref<typeof FormInput | null>(null);

const form = reactive<{
  data: {
    studentId: string;
    email: string;
    programId: string;
  };
  errors: {
    studentId?: string;
    email?: string;
    programId?: string;
  };
}>({
  data: {
    studentId: "",
    email: "",
    programId: "",
  },
  errors: {},
});

const filteredCourses = computed(() => {
  let courses = [...allCourses.value];
  if (selectedCourse.value) {
    courses = courses.filter((c) => c.id !== selectedCourse.value?.id);
  }
  if (courseSearchQuery.value.trim()) {
    const query = courseSearchQuery.value.toLowerCase();
    courses = courses.filter((c) => c.name.toLowerCase().includes(query));
  }
  return courses;
});

const canSubmit = computed(() => {
  return form.data.studentId && form.data.email;
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
  return selectedCourse.value?.id === course.id;
};

const selectCourse = (course: Course) => {
  selectedCourse.value = course;
  courseSearchQuery.value = "";
  form.data.programId = course.id.toString();
};

const validateForm = (): boolean => {
  form.errors = {};
  if (!form.data.studentId) form.errors.studentId = "Student ID is required";
  if (!form.data.email) form.errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.data.email)) {
    form.errors.email = "Invalid email format";
  }
  if (!form.data.programId) form.errors.programId = "Program is required";
  return !Object.values(form.errors).some(Boolean);
};

const { call: inviteStudent } = useBackendService("/students/invite", "post");

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;

  try {
    const payload = {
      reg_number: form.data.studentId,
      email: form.data.email,
      program_id: Number(form.data.programId),
    };
    await inviteStudent(payload);

    emit("invite-success");
    close();
  } catch (err) {
    emit("invite-failure");
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  form.data = {
    studentId: "",
    email: "",
    programId: "0",
  };
  form.errors = {};
  selectedCourse.value = null;
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

onMounted(() => {
  fetchCourses();
});

const allCourses = ref<Course[]>([]);

const {
  call: fetchPrograms,
  isLoading: loading,
  data: programsData,
} = useBackendService("/programs", "get");
const fetchCourses = async () => {
  try {
    await fetchPrograms();
    allCourses.value = programsData.value.map((c: any) => ({
      id: c.programId,
      name: c.programName,
    }));
  } catch (error) {
    toast.error("Could not load courses. Please try again.");
    console.error(error);
  }
};

watch(
  () => props.modelValue,
  (value) => {
    resetForm();
  }
);

const dropdownContainer = ref<HTMLElement | null>(null);

// Close dropdown when clicking outside
onClickOutside(dropdownContainer, () => {
  isDropdownOpen.value = false;
});
</script>

<style lang="scss" scoped>
.modal-body {
  .form-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
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
    z-index: 1;
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
}
</style>
