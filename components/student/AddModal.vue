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
                <h2 class="modal-title">Invite Students</h2>
                <p>
                  Invite students to streamline their support and
                  enhance their academic experience.
                </p>
              </div>
              <button
                class="close-button"
                aria-label="Close"
                @click="close"
              >
                <CloseCircleIcon />
              </button>
            </div>

            <div class="modal-body">
              <div class="form-section">
                <FormInput
                  id="student-id"
                  v-model="form.data.studentId"
                  label="Student ID"
                  placeholder="Enter student ID"
                  required
                  :error="form.errors.studentId"
                />

                <!-- Student Email -->
                <FormInput
                  id="student-email"
                  v-model="form.data.email"
                  label="Student Email"
                  placeholder="Enter student email"
                  type="email"
                  required
                  :error="form.errors.email"
                />

                <!-- Program to enroll student -->
                <UiFormSelect
                  id="student-program"
                  v-model="form.data.programId"
                  label="Program"
                  placeholder="Select Student Program"
                  type="string"
                  :options="programs"
                  required
                  :error="form.errors.programId"
                />
              </div>
            </div>

            <div class="modal-footer">
              <Button
                variant="secondary"
                @click="close"
              >
                Cancel
              </Button>
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
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useToast } from '~/composables/useToast';
import type { ProgramOutput } from '~/types/program';
import CloseCircleIcon from '../icons/CloseCircleIcon.vue';
import Button from '../ui/Button.vue';
import FormInput from '../ui/FormInput.vue';
import { isArray, isEqual } from 'lodash-es';

interface ProgramType {
  value: string;
  label: string;
}

interface Props {
  modelValue: boolean;
  loading?: boolean;
  persistent?: boolean;
  program?: ProgramOutput | null;
  availablePrograms?: ProgramType[];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  persistent: false,
  program: null,
});

const emit = defineEmits<{
  (e: 'update:modelValue' | 'update:loading', value: boolean): void;
  (e: 'invite-success' | 'invite-failure'): void;
}>();

const localIsLoading = ref(false);
const isLoading = computed({
  get() {
    return localIsLoading.value
      ? localIsLoading.value
      : props.loading;
  },
  set(val: boolean) {
    localIsLoading.value = val;
    emit('loading', val);
  },
});
const toast = useToast();

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
    studentId: '',
    email: '',
    programId: '',
  },
  errors: {},
});

const canSubmit = computed(() => {
  return form.data.studentId && form.data.email;
});

const validateForm = (): boolean => {
  form.errors = {};
  if (!form.data.studentId)
    form.errors.studentId = 'Student ID is required';
  if (!form.data.email) form.errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.data.email)) {
    form.errors.email = 'Invalid email format';
  }
  if (!form.data.programId)
    form.errors.programId = 'Program is required';
  return !Object.values(form.errors).some(Boolean);
};

// Ensure validation after updating any form field
watch(
  [
    () => form.data.studentId,
    () => form.data.email,
    () => form.data.programId,
  ],
  (curr, prev) => {
    if (!isEqual(curr, prev)) {
      validateForm();
    }
  },
);

const { call: inviteStudent } = useBackendService(
  '/students/invite',
  'post',
);

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

    emit('invite-success');
    close();
  } catch (err) {
    emit('invite-failure');
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  console.trace('Called reset form here');
  form.data = {
    studentId: '',
    email: '',
    programId: '',
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

const programs = ref<ProgramType[]>([]);

const {
  call: fetchPrograms,
  isLoading: isLoadingProgram,
  data: programsData,
} = useBackendService('/programs', 'get');

const fetchAndSyncPrograms = async () => {
  try {
    await fetchPrograms();
    const list = programsData as Ref<
      {
        programId: string | number;
        programName: string;
      }[]
    >;

    if (isArray(list.value)) {
      programs.value = list.value.map((p) => ({
        value: String(p.programId),
        label: p.programName,
      }));
    }
  } catch (error) {
    toast.error('Could not load programs. Please try again.');
    console.error(error);
  }
};

watch(() => props.modelValue, resetForm);

onMounted(() => {
  fetchAndSyncPrograms();
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
