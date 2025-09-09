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
                <h2 class="modal-title">Add Students</h2>
                <p class="modal-subtitle">
                  Select students you have verified to this session
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
                <!-- Search input -->
                <div class="form-field">
                  <FormInput
                    id="student-search"
                    ref="studentInput"
                    v-model="studentSearchQuery"
                    label=""
                    placeholder="Enter student name(s)"
                  />
                </div>
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                  "
                >
                  <div>({{ selectedStudents.length }} SELECTED)</div>
                  <div>
                    <div>
                      <div class="select-all">
                        <CheckBoxChecked
                          v-if="isAllSelected"
                          @click="toggleSelectAll"
                        />
                        <CheckBox
                          v-else
                          @click="toggleSelectAll"
                        />
                        <label
                          for="select-all"
                          class="checkbox-label"
                          >All students</label
                        >
                      </div>
                    </div>
                  </div>
                </div>

                <div class="students-container">
                  <!-- Loading state -->
                  <div
                    v-if="loadingStudents"
                    class="loading-state"
                  >
                    <div class="loading-message">
                      Loading students...
                    </div>
                  </div>

                  <div
                    v-else
                    class="students-list"
                  >
                    <div
                      v-for="student in filteredStudents"
                      :key="student.studentId"
                      class="student-item"
                      :class="{
                        selected: isStudentSelected(student),
                      }"
                      @click="toggleStudent(student)"
                    >
                      <div
                        class="student-info"
                        style="
                          display: flex;
                          align-items: center;
                          flex-direction: row;
                          gap: 10px;
                        "
                      >
                        <img
                          :src="
                            student.profilePicture ||
                            '/default-avatar.png'
                          "
                          class="avatar"
                        />
                        <div class="student-name">
                          {{ student.firstName }}
                          {{ student.lastName }}
                        </div>
                      </div>
                      <div
                        class="student-checkbox"
                        @click.stop="toggleStudent(student)"
                      >
                        <div class="checkbox-wrapper">
                          <CheckBoxChecked
                            v-if="isStudentSelected(student)"
                          />
                          <CheckBox v-else />
                        </div>
                      </div>
                    </div>

                    <!-- Empty state -->
                    <div
                      v-if="
                        filteredStudents.length === 0 &&
                        !loadingStudents
                      "
                    >
                      <EmptyState
                        v-if="filteredStudents.length === 0"
                        class="empty-state"
                        title="Didn’t find student?"
                        description="Can’t find a student on the list? Send an Invite to any students "
                      >
                        <template #icon>
                          <img
                            src="~/assets/images/EmptyUser.svg"
                            alt="Users Illustration"
                            class="empty-state-illustration"
                            style="width: 80px; height: 80px"
                          />
                        </template>
                        <template #action>
                          <Button
                            variant="outline"
                            size="sm"
                            @click="$router.push('/admin/students')"
                          >
                            <template #icon>
                              <PlusIcon />
                            </template>
                            Invite Student
                          </Button>
                        </template>
                      </EmptyState>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style="justify-content: space-between"
              class="modal-footer"
            >
              <div
                style="
                  cursor: pointer;
                  color: #254383;
                  font-weight: 600;
                "
                @click="$router.push('/admin/students')"
              >
                Invite new student?
              </div>

              <Button
                variant="primary"
                :disabled="isLoading || selectedStudents.length === 0"
                :loading="isLoading"
                style="width: 5vw"
                @click="handleFinishClick"
              >
                Finish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useToast } from '~/composables/useToast';
import CheckBox from '../icons/CheckBox.vue';
import CheckBoxChecked from '../icons/CheckBoxChecked.vue';
import CloseCircleIcon from '../icons/CloseCircleIcon.vue';
import PlusIcon from '../icons/PlusIcon.vue';
import Button from '../ui/Button.vue';
import EmptyState from '../ui/EmptyState.vue';
import FormInput from '../ui/FormInput.vue';
import type { StudentType } from '~/types/student';

interface Student {
  firstName: string;
  lastName: string;
  email: string;
  studentId: number;
  profilePicture: string;
}

interface Props {
  modelValue: boolean;
  loading?: boolean;
  persistent?: boolean;
  availableStudents?: Student[];
  sessionId?: string | number;
  mode?: 'single' | 'main';
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  persistent: false,
  availableStudents: () => [],
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (
    e: 'students-added' | 'submit-session-form',
    students: Student[],
  ): void;
  (e: 'click'): void;
}>();

const isLoading = ref(false);
const selectedStudents = ref<Student[]>([]);
const studentSearchQuery = ref('');
const studentInput = ref<typeof FormInput | null>(null);
const toast = useToast();

const {
  call: fetchStudents,
  isLoading: loadingStudents,
  data: studentsData,
} = useBackendService('/students', 'get');

const transformBackendStudent = (
  backendStudent: StudentType,
): Student => {
  return {
    studentId: backendStudent.student_id,
    firstName: backendStudent.first_name ?? '',
    lastName: backendStudent.last_name ?? '',
    email: backendStudent.email,
    profilePicture:
      backendStudent.profile_picture ||
      `https://lccvdfvlczhicqnrelsv.supabase.co/storage/v1/object/public/cuce/static/default.png`,
  };
};

const availableStudentsForSelection = computed(() => {
  if (!studentsData.value) return [] as Student[];

  const availableStudentIds = props.availableStudents.map(
    (s) => s.studentId,
  );

  const studentList = studentsData.value as unknown as StudentType[];

  return studentList
    .filter(
      (student: StudentType) =>
        !availableStudentIds.includes(student.student_id),
    )
    .map(transformBackendStudent);
});

const filteredStudents = computed(() => {
  if (!studentSearchQuery.value.trim()) {
    return availableStudentsForSelection.value;
  }

  const query = studentSearchQuery.value.toLowerCase();

  return availableStudentsForSelection.value.filter(
    (student) =>
      String(student.firstName ?? '')
        .toLowerCase()
        .includes(query) ||
      String(student.email ?? '')
        .toLowerCase()
        .includes(query) ||
      String(student.lastName ?? '')
        .toLowerCase()
        .includes(query),
  );
});

const isAllSelected = computed(() => {
  return (
    filteredStudents.value.length > 0 &&
    filteredStudents.value.every((student) =>
      isStudentSelected(student),
    )
  );
});

const isStudentSelected = (student: Student) => {
  return selectedStudents.value.some(
    (s) => s.studentId === student.studentId,
  );
};

const toggleStudent = (student: Student) => {
  const index = selectedStudents.value.findIndex(
    (s) => s.studentId === student.studentId,
  );
  if (index === -1) {
    selectedStudents.value.push(student);
  } else {
    selectedStudents.value.splice(index, 1);
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    filteredStudents.value.forEach((student) => {
      const index = selectedStudents.value.findIndex(
        (s) => s.studentId === student.studentId,
      );
      if (index !== -1) {
        selectedStudents.value.splice(index, 1);
      }
    });
  } else {
    filteredStudents.value.forEach((student) => {
      if (!isStudentSelected(student)) {
        selectedStudents.value.push(student);
      }
    });
  }
};

const handleSubmit = async () => {
  if (selectedStudents.value.length === 0 || !props.sessionId) {
    return;
  }

  isLoading.value = true;

  const sessionId = props.sessionId;
  const { call: addStudentsToSession } = useBackendService(
    `/sessions/${sessionId}/students`,
    'post',
  );

  try {
    await addStudentsToSession({
      studentIds: selectedStudents.value.map(
        (student) => student.studentId,
      ),
    });
    toast.success(
      `${selectedStudents.value.length} student${
        selectedStudents.value.length !== 1 ? 's' : ''
      } added successfully`,
    );
    emit('submit-session-form', selectedStudents.value);
  } catch (error) {
    console.dir(error);
    toast.error('Failed to add students. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  selectedStudents.value = [];
  studentSearchQuery.value = '';
};

const close = () => {
  emit('update:modelValue', false);
};
const handleFinishClick = () => {
  if (props.mode === 'main') {
    handleAddStudentClick();
  } else {
    handleSubmit();
  }
};

const handleAddStudentClick = () => {
  const selectedIds = selectedStudents.value.map((s) => s.studentId);
  emit('submit-session-form', selectedIds);
};

const onOverlayClick = () => {
  if (!props.persistent && !isLoading.value) {
    close();
  }
};

const loadStudents = async () => {
  try {
    await fetchStudents();
  } catch (error) {
    console.error('Error fetching students:', error);
    toast.error('Failed to load students. Please try again.');
  }
};

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      loadStudents();
    } else {
      resetForm();
    }
  },
);

onMounted(() => {
  if (props.modelValue) {
    loadStudents();
  }
});
</script>

<style lang="scss" scoped>
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.loading-state {
  padding: 40px 16px;
  text-align: center;
}

.loading-message {
  color: $gray-600;
  font-size: $text-sm;
}

.modal-body {
  .form-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .modal-subtitle {
    font-size: $text-sm;
    color: $gray-600;
    margin-top: 4px;
  }

  .students-container {
    border: 1px solid $gray-200;
    border-radius: 8px;
    overflow: hidden;
  }

  .students-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: $gray-50;
    border-bottom: 1px solid $gray-200;
    font-size: $text-sm;
  }

  .selected-count {
    font-weight: 500;
    color: $gray-900;
  }

  .select-all {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .students-list {
    max-height: 300px;
    overflow-y: auto;
    background-color: $white;
  }

  .student-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid $gray-100;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: $gray-50;
    }

    &.selected {
      background-color: $primary-color-50;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .student-info {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .student-name {
    font-weight: 500;
    color: $gray-900;
    margin-bottom: 2px;
  }

  .student-checkbox {
    margin-left: 12px;
  }

  .checkbox {
    width: 16px;
    height: 16px;
    border: 2px solid $gray-300;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s;

    &:checked {
      background-color: $primary-color-600;
      border-color: $primary-color-600;

      position: relative;

      &::after {
        position: absolute;
        top: -2px;
        left: 1px;
        color: white;
        font-size: 12px;
        font-weight: bold;
      }
    }
  }

  .checkbox-label {
    font-size: $text-sm;
    color: $gray-700;
    cursor: pointer;
    user-select: none;
  }

  .empty-state {
    text-align: center;
  }

  .empty-message {
    color: $gray-600;
    font-size: $text-sm;
  }
}
</style>
