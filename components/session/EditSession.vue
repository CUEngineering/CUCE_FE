<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="modal-overlay"
        @click="onOverlayClick"
      >
        <div
          class="modal-container"
          @click.stop
        >
          <div class="modal o-visible">
            <div class="modal-header">
              <div class="header-content">
                <h2 class="modal-title">{{ modalTitle }}</h2>
              </div>
              <button
                class="close-button"
                aria-label="Close"
                @click="close"
              >
                <IconsCloseCircleIcon />
              </button>
            </div>

            <div class="modal-body">
              <div class="form-section">
                <UiFormInput
                  id="session-name"
                  v-model="form.data.session_name"
                  label="Session Name"
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
                  <UiFormInput
                    id="start-date"
                    v-model="form.data.start_date"
                    style="width: 47%"
                    label="Start Date"
                    type="datetime-local"
                    required
                    :error="form.errors.start_date"
                  />

                  <UiFormInput
                    id="end-date"
                    v-model="form.data.end_date"
                    style="width: 47%"
                    label="End Date"
                    type="datetime-local"
                    required
                    :error="form.errors.end_date"
                  />
                </div>

                <UiFormInput
                  id="enrollment-deadline"
                  v-model="form.data.enrollment_deadline"
                  label="Enrollment Deadline"
                  type="datetime-local"
                  required
                  :error="form.errors.enrollment_deadline"
                  :min="
                    form.data.start_date
                      ? form.data.start_date
                      : undefined
                  "
                  :max="
                    form.data.end_date
                      ? form.data.end_date
                      : undefined
                  "
                />
              </div>
            </div>

            <div
              v-if="props.mode === 'edit'"
              class="modal-footer"
            >
              <UiButton
                variant="secondary"
                @click="close"
              >
                Cancel
              </UiButton>
              <UiButton
                variant="primary"
                :disabled="isLoading || !canSubmit"
                :loading="isLoading"
                @click="handleSubmit"
              >
                {{ submitButtonText }}
              </UiButton>
            </div>
            <div
              v-if="props.mode === 'add'"
              style="
                display: flex;
                width: 100%;
                justify-content: space-between;
              "
              class="modal-footer"
            >
              <div
                style="
                  cursor: pointer;
                  color: #254383;
                  font-weight: 600;
                "
                @click="handleSubmit"
              >
                Skip & create
              </div>
              <UiButton
                style="width: 30%"
                variant="primary"
                :disabled="isLoading || !canSubmit"
                :loading="isLoading"
                @click="handleAddStudentClick"
              >
                Add Student <IconsRightArrow />
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  areIntervalsOverlapping,
  format,
  isAfter,
  isBefore,
  isValid,
  isWithinInterval,
} from 'date-fns';
import { isArray, values } from 'lodash-es';
import { computed, reactive, ref, watch } from 'vue';
import type { Session } from '~/pages/admin/sessions/[id].vue';

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
  mode?: 'add' | 'edit';
  session?: Session | null;
  ignoredDateRanges?: {
    session_id: string | number;
    start_date: string | Date | number;
    end_date: string | Date | number;
  }[];
}

const props = withDefaults(defineProps<Props>(), {
  ignoredDateRanges: () => [],
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (
    e: 'sessionUpdate' | 'submit-session-form',
    session: Partial<Session>,
  ): void;
  (e: 'add-student'): void;
}>();

const handleAddStudentClick = () => {
  emit('add-student');
  emit('submit-session-form', { ...form.data });
};

const isLoading = ref(false);

// Form state
const form = reactive<{
  data: SessionForm;
  errors: Errors;
}>({
  data: {
    session_name: '',
    start_date: '',
    end_date: '',
    enrollment_deadline: '',
  },
  errors: {},
});

// Computed properties
const modalTitle = computed(() => {
  return props.mode === 'edit' ? 'Edit Session' : 'Add Session';
});

const submitButtonText = computed(() => {
  return props.mode === 'edit' ? 'Save Changes' : 'Create Session';
});

const canSubmit = computed(() => {
  return (
    isArray(props.ignoredDateRanges || []) && !validateFormData()
  );
});

// Validation
const validateFormData = () => {
  let ignoredDateRanges = props.ignoredDateRanges || [];
  ignoredDateRanges =
    props.session && props.mode === 'edit'
      ? ignoredDateRanges.filter(
          (session) =>
            String(session.session_id) !==
            String(props.session?.session_id),
        )
      : ignoredDateRanges;

  if (!form.data.session_name) {
    form.errors.session_name = `Session name is required`;
  } else {
    form.errors.session_name = undefined;
  }

  let startDate: Date | undefined = undefined;
  if (!form.data.start_date) {
    form.errors.start_date = `Session start date is required`;
  } else {
    startDate = new Date(form.data.start_date);
    startDate = isValid(startDate) ? startDate : undefined;

    if (!startDate) {
      form.errors.start_date = `Session start date is not a valid date`;
    } else {
      form.errors.start_date = undefined;
    }
  }

  let endDate: Date | undefined = undefined;
  if (!form.data.end_date) {
    form.errors.end_date = `Session end date is required`;
  } else {
    endDate = new Date(form.data.end_date);
    endDate = isValid(endDate) ? endDate : undefined;

    if (!endDate) {
      form.errors.end_date = `Session end date is not a valid date`;
    } else {
      if (startDate && !isAfter(endDate, startDate)) {
        form.errors.end_date = `Session end date must be after the start date`;
      } else if (
        ignoredDateRanges.some(
          (range) =>
            !!startDate &&
            !!endDate &&
            areIntervalsOverlapping(
              {
                start: range.start_date,
                end: range.end_date,
              },
              {
                start: startDate,
                end: endDate,
              },
              {
                inclusive: true,
              },
            ),
        )
      ) {
        form.errors.start_date = `Session overlaps with an existing session start/end date range`;
        form.errors.end_date = `Session overlaps with an existing session start/end date range`;
      } else {
        form.errors.end_date = undefined;

        if (startDate) {
          form.errors.start_date = undefined;
        }
      }
    }
  }

  let enrollmentDeadline: Date | undefined = undefined;
  if (!form.data.enrollment_deadline) {
    form.errors.enrollment_deadline = `Session end date is required`;
  } else {
    enrollmentDeadline = new Date(form.data.enrollment_deadline);
    enrollmentDeadline = isValid(enrollmentDeadline)
      ? enrollmentDeadline
      : undefined;

    if (!enrollmentDeadline) {
      form.errors.enrollment_deadline = `Session enrollment deadline is not a valid date`;
    } else {
      if (
        startDate &&
        endDate &&
        !isWithinInterval(enrollmentDeadline, {
          start: startDate,
          end: endDate,
        })
      ) {
        form.errors.enrollment_deadline = `Session enrollment deadline must be after the start date and before the end date`;
      } else if (
        startDate &&
        !isAfter(enrollmentDeadline, startDate)
      ) {
        form.errors.enrollment_deadline = `Session enrollment deadline must be after the start date`;
      } else if (endDate && !isBefore(enrollmentDeadline, endDate)) {
        form.errors.enrollment_deadline = `Session enrollment deadline must be before the end date`;
      } else {
        form.errors.enrollment_deadline = undefined;
      }
    }
  }

  return values(form.errors).some((val) => !!val);
};

// Submit handler
const handleSubmit = async () => {
  if (!canSubmit.value) {
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

    if (props.mode === 'edit' && props.session) {
      updatedSession.session_id = props.session.session_id;
    }

    emit('sessionUpdate', updatedSession);
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  form.data = {
    session_name: '',
    start_date: '',
    end_date: '',
    enrollment_deadline: '',
  };
  form.errors = {};
};

const close = () => {
  emit('update:modelValue', false);
};

const onOverlayClick = () => {
  if (!props.persistent && !isLoading.value) {
    close();
  }
};

const autoFillFormInputsForEdit = () => {
  form.data.session_name =
    form.data.session_name || props.session?.session_name || '';

  const startDateStr =
    form.data.start_date || props.session?.start_date || '';
  if (startDateStr) {
    form.data.start_date = format(
      new Date(startDateStr),
      `yyyy-MM-dd HH:mm:ss.SSS`,
    );
  }

  const endDateStr =
    form.data.end_date || props.session?.end_date || '';
  if (endDateStr) {
    form.data.end_date = format(
      new Date(endDateStr),
      `yyyy-MM-dd HH:mm:ss.SSS`,
    );
  }

  const enrollmentDeadlineStr =
    form.data.enrollment_deadline ||
    props.session?.enrollment_deadline ||
    '';

  if (enrollmentDeadlineStr) {
    form.data.enrollment_deadline = format(
      new Date(enrollmentDeadlineStr),
      `yyyy-MM-dd HH:mm:ss.SSS`,
    );
  }
};

// Initialize form with session data when editing
watch(
  [() => props.mode, () => props.modelValue, () => props.session],
  ([mode, _]) => {
    switch (mode) {
      case 'add': {
        resetForm();
        break;
      }

      case 'edit': {
        autoFillFormInputsForEdit();
        break;
      }
    }
  },
  {
    immediate: true,
    deep: true,
  },
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
