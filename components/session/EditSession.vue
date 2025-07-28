<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="onOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="modal o-visible">
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
                <FormInput
                  id="session-name"
                  label="Session Name"
                  v-model="form.data.session_name"
                  placeholder="Enter session name"
                  required
                  :error="form.errors.session_name"
                />
                <div
                  style="
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                  "
                >
                  <FormInput
                    style="width: 47%"
                    id="start-date"
                    label="Start Date"
                    v-model="form.data.start_date"
                    type="date"
                    required
                    :error="form.errors.start_date"
                  />

                  <FormInput
                    style="width: 47%"
                    id="end-date"
                    label="End Date"
                    v-model="form.data.end_date"
                    type="date"
                    required
                    :error="form.errors.end_date"
                  />
                </div>

                <FormInput
                  id="enrollment-deadline"
                  label="Enrollment Deadline"
                  v-model="form.data.enrollment_deadline"
                  type="date"
                  required
                  :error="form.errors.enrollment_deadline"
                />
              </div>
            </div>

            <div v-if="props.mode === 'edit'" class="modal-footer">
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
            <div
              style="display: flex; width: 100%; justify-content: space-between"
              v-if="props.mode === 'add'"
              class="modal-footer"
            >
              <div
                style="cursor: pointer; color: #254383; font-weight: 600"
                @click="handleSubmit"
              >
                Skip & create
              </div>
              <Button
                style="width: 30%"
                variant="primary"
                :disabled="isLoading || !canSubmit"
                :loading="isLoading"
                @click="handleAddStudentClick"
              >
                Add Student <RightArrow />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import type { Session } from "~/pages/admin/sessions/[id].vue";
import CloseCircleIcon from "../icons/CloseCircleIcon.vue";
import RightArrow from "../icons/RightArrow.vue";
import Button from "../ui/Button.vue";
import FormInput from "../ui/FormInput.vue";

interface SessionForm {
  session_name: string;
  start_date: string;
  end_date: string;
  enrollment_deadline: string;
}

interface Errors {
  session_name?: string;
  start_date?: string;
  end_date?: string;
  enrollment_deadline?: string;
}

interface Props {
  modelValue: boolean;
  loading?: boolean;
  persistent?: boolean;
  mode?: "add" | "edit";
  session?: Session | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "sessionUpdate", session: Partial<Session>): void;
  (e: "add-student"): void;
  (e: "submit-session-form", session: Partial<Session>): void;
}>();
const handleAddStudentClick = () => {
  emit("add-student");
  emit("submit-session-form", { ...form.data });
};

const isLoading = ref(false);

// Form state
const form = reactive<{
  data: SessionForm;
  errors: Errors;
}>({
  data: {
    session_name: "",
    start_date: "",
    end_date: "",
    enrollment_deadline: "",
  },
  errors: {},
});

// Computed properties
const modalTitle = computed(() => {
  return props.mode === "edit" ? "Edit Session" : "Add Session";
});

const submitButtonText = computed(() => {
  return props.mode === "edit" ? "Save Changes" : "Create Session";
});

const canSubmit = computed(() => {
  return (
    form.data.session_name &&
    form.data.start_date &&
    form.data.end_date &&
    form.data.enrollment_deadline &&
    !validateDates()
  );
});

// Validation
const validateDates = () => {
  const startDate = new Date(form.data.start_date);
  const endDate = new Date(form.data.end_date);
  const enrollmentDeadline = new Date(form.data.enrollment_deadline);

  // Clear previous errors
  form.errors = {};

  let hasErrors = false;

  // Check if end date is after start date
  if (endDate <= startDate) {
    form.errors.end_date = "End date must be after start date";
    hasErrors = true;
  }

  // Check if enrollment deadline is after end date
  if (enrollmentDeadline > endDate) {
    form.errors.enrollment_deadline =
      "Enrollment deadline must be before or equal to end date";
    hasErrors = true;
  }

  return hasErrors;
};

// Watch for date changes to validate
watch(
  () => [
    form.data.start_date,
    form.data.end_date,
    form.data.enrollment_deadline,
  ],
  () => {
    if (
      form.data.start_date &&
      form.data.end_date &&
      form.data.enrollment_deadline
    ) {
      validateDates();
    }
  }
);

// Submit handler
const handleSubmit = async () => {
  if (validateDates()) {
    return;
  }

  isLoading.value = true;

  try {
    const updatedSession: Partial<Session> = {
      session_name: form.data.session_name,
      start_date: form.data.start_date,
      end_date: form.data.end_date,
      enrollment_deadline: form.data.enrollment_deadline,
    };

    if (props.mode === "edit" && props.session) {
      updatedSession.session_id = props.session.session_id;
    }

    emit("sessionUpdate", updatedSession);
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  form.data = {
    session_name: "",
    start_date: "",
    end_date: "",
    enrollment_deadline: "",
  };
  form.errors = {};
};

const close = () => {
  emit("update:modelValue", false);
};

const onOverlayClick = () => {
  if (!props.persistent && !isLoading.value) {
    close();
  }
};

// Helper function to format date for input
const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

// Initialize form with session data when editing
const initializeForm = () => {
  if (props.mode === "edit" && props.session) {
    form.data.session_name = props.session.session_name || "hgj";
    form.data.start_date = formatDateForInput(props.session.start_date);
    form.data.end_date = formatDateForInput(props.session.end_date);
    form.data.enrollment_deadline = formatDateForInput(
      props.session.enrollment_deadline
    );
  } else {
    resetForm();
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
  () => props.session,
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
