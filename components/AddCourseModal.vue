<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="onOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="modal o-visible">
            <div class="modal-header">
              <div class="header-content">
                <h2 class="modal-title">{{ modalTitle }}</h2>
                <p class="">{{ modalSubTitle }}</p>
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
                      >Course Type</label
                    >
                    <div class="radio-group">
                      <div
                        v-for="option in [
                          'UNDERGRADUATE',
                          'MASTERS',
                          'DOCTORATE',
                        ]"
                        :key="option"
                        class="radio-option"
                        :class="{ selected: form.data.course_type === option }"
                        @click="form.data.course_type = option"
                      >
                        <div class="radio">
                          <div
                            v-if="form.data.course_type === option"
                            class="radio-indicator"
                          ></div>
                        </div>
                        <span class="radio-label">{{ option }}</span>
                      </div>
                    </div>
                    <p v-if="form.errors.course_type" class="input-error">
                      {{ form.errors.course_type }}
                    </p>
                  </div>

                  <FormInput
                    id="course-title"
                    label="Course Title"
                    v-model="form.data.course_title"
                    placeholder="Enter course title"
                    required
                    :error="form.errors.course_title"
                  />
                  <div style="display: flex">
                    <FormInput
                      id="course-code"
                      label="Course Code"
                      v-model="form.data.course_code"
                      placeholder="e.g. AI101"
                      style="margin: 5px"
                      required
                      :error="form.errors.course_code"
                    />
                    <FormInput
                      id="course-credits"
                      label="Course Credits"
                      v-model="form.data.course_credits"
                      type="number"
                      placeholder="0"
                      style="margin: 5px"
                      required
                      :error="form.errors.course_credits"
                    />
                  </div>
                </template>
              </div>
            </div>

            <div class="modal-footer">
              <Button variant="secondary" @click="close"> Cancel </Button>
              <Button
                variant="primary"
                :disabled="isLoading"
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
import { onClickOutside } from "@vueuse/core";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useToast } from "~/composables/useToast";
import type { ProgramOutput } from "~/types/program";
import CloseCircleIcon from "./icons/CloseCircleIcon.vue";
import Button from "./ui/Button.vue";
import FormInput from "./ui/FormInput.vue";

interface Course {
  id: number;
  title: string;
  code: string;
  credits: number;
  enrolledStudents: number;
}

interface Props {
  modelValue: boolean;
  loading?: boolean;
  persistent?: boolean;
  mode?: "add" | "edit" | "addCourses";
  program?: any | null;
  availableCourses?: Course[];
  selectedProgramCourses?: Course[];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  persistent: false,
  mode: "add",
  program: null,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "program-added", program: ProgramOutput): void;
  (e: "program-updated", program: ProgramOutput): void;
  (e: "courses-added", courses: Course[]): void;
}>();

const isLoading = ref(false);
const toast = useToast();

// Course selection state

const isDropdownOpen = ref(false);

const form = reactive<{
  data: {
    course_title: string;
    course_code: string;
    course_credits: string;
    course_type: string;
  };
  errors: {
    course_title?: string;
    course_code?: string;
    course_credits?: string;
    course_type?: string;
  };
}>({
  data: {
    course_title: "",
    course_code: "",
    course_credits: "0",
    course_type: "",
  },
  errors: {},
});

// Computed properties
const modalTitle = computed(() => {
  switch (props.mode) {
    case "edit":
      return "Course Details";
    case "addCourses":
      return "Add Courses to Program";
    case "add":
    default:
      return "Create a new course";
  }
});
const modalSubTitle = computed(() => {
  switch (props.mode) {
    case "edit":
      return "";
    case "addCourses":
      return "";
    case "add":
    default:
      return "Enter necessary details to create course";
  }
});

const submitButtonText = computed(() => {
  switch (props.mode) {
    case "edit":
      return "Save";
    case "addCourses":
      return "Add";
    case "add":
    default:
      return "Create";
  }
});

const validateForm = (): boolean => {
  form.errors = {};

  if (!form.data.course_title) {
    form.errors.course_title = "Course title is required";
  }

  if (!form.data.course_code) {
    form.errors.course_code = "Course code is required";
  }

  if (!form.data.course_type) {
    form.errors.course_type = "Course type is required";
  }

  if (!form.data.course_credits || isNaN(Number(form.data.course_credits))) {
    form.errors.course_credits = "Valid credits are required";
  }

  return Object.keys(form.errors).length === 0;
};

// Submit handler
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;

  const payload = {
    course_title: form.data.course_title.trim(),
    course_code: form.data.course_code.trim(),
    course_credits: Number(form.data.course_credits),
    course_type: form.data.course_type.trim(),
  };

  try {
    if (props.mode === "add") {
      const {
        call: addCourse,
        isLoading: loading,
        data: courseData,
      } = useBackendService("/courses", "post");

      await addCourse(payload);
      emit("program-added", courseData.value);
      toast.success(`Course "${form.data.course_title}" created successfully`);
    } else if (props.mode === "edit" && props.program) {
      const {
        call: updateCourse,
        isLoading,
        data: courseData,
      } = useBackendService(
        `/courses/${props.program.value.course_id}`,
        "patch"
      );

      updateCourse(payload);

      emit("program-updated", courseData.value);
      toast.success(`Course "${form.data.course_title}" updated successfully`);
    }

    close();
  } catch (error: any) {
    console.error("Submission error:", error);
    toast.error(
      error.response?.data?.message ||
        `Failed to ${props.mode} course. Please try again.`
    );
  } finally {
    isLoading.value = false;
  }
};

const close = () => {
  emit("update:modelValue", false);
};

const onOverlayClick = () => {
  if (!props.persistent && !isLoading.value) {
    close();
  }
};

const initializeForm = () => {
  if (props.mode === "edit" && props.program) {
    console.log(props.program);
    form.data.course_title = props.program?.value.course_title || "";
    form.data.course_code = props.program?.value.course_code || "";
    form.data.course_credits = String(props.program?.value.course_credits || 0);
    form.data.course_type = props.program?.value.course_type || "";
  }
};

// Initialize on mount and when props change
onMounted(initializeForm);

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      initializeForm();
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
