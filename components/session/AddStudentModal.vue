<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="onOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="modal o-visible">
            <div class="modal-header">
              <div class="header-content">
                <h2 class="modal-title">Add Students</h2>
                <p class="modal-subtitle">
                  Select students you have verified to this session
                </p>
              </div>
              <button class="close-button" @click="close" aria-label="Close">
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
                    label=""
                    v-model="studentSearchQuery"
                    placeholder="Enter student names"
                    @input="handleStudentSearch"
                  />
                </div>

                <!-- Students list container -->
                <div class="students-container">
                  <!-- Header with count and select all -->
                  <div class="students-header">
                    <div class="selected-count">
                      {{ selectedStudents.length }} selected
                    </div>
                    <div class="select-all">
                      <input
                        type="checkbox"
                        id="select-all"
                        :checked="isAllSelected"
                        :indeterminate="isIndeterminate"
                        @change="toggleSelectAll"
                        class="checkbox"
                      />
                      <label for="select-all" class="checkbox-label"
                        >Select all</label
                      >
                    </div>
                  </div>

                  <!-- Students list -->
                  <div class="students-list">
                    <div
                      v-for="student in filteredStudents"
                      :key="student.id"
                      class="student-item"
                      :class="{ selected: isStudentSelected(student) }"
                      @click="toggleStudent(student)"
                    >
                      <div class="student-info">
                        <div class="student-name">{{ student.name }}</div>
                        <div class="student-details">
                          {{ student.email }} • {{ student.studentId }}
                        </div>
                      </div>
                      <div class="student-checkbox">
                        <input
                          type="checkbox"
                          :id="`student-${student.id}`"
                          :checked="isStudentSelected(student)"
                          @click.stop
                          @change="toggleStudent(student)"
                          class="checkbox"
                        />
                      </div>
                    </div>

                    <!-- Empty state -->
                    <div
                      v-if="filteredStudents.length === 0"
                      class="empty-state"
                    >
                      <div class="empty-message">
                        {{
                          studentSearchQuery
                            ? "No students found matching your search"
                            : "No students available"
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style="justify-content: space-between" class="modal-footer">
              <div style="cursor: pointer; color: #254383; font-weight: 600">
                Invite new student?
              </div>

              <Button
                variant="primary"
                :disabled="isLoading || selectedStudents.length === 0"
                :loading="isLoading"
                @click="handleSubmit"
                style="width: 20vw"
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
import { computed, ref, watch } from "vue";
import { useToast } from "~/composables/useToast";
import CloseCircleIcon from "../icons/CloseCircleIcon.vue";
import Button from "../ui/Button.vue";
import FormInput from "../ui/FormInput.vue";

interface Student {
  id: number;
  name: string;
  email: string;
  studentId: string;
}

interface Props {
  modelValue: boolean;
  loading?: boolean;
  persistent?: boolean;
  availableStudents?: Student[];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  persistent: false,
  availableStudents: () => [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      studentId: "STU001",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      studentId: "STU002",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      studentId: "STU003",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      studentId: "STU004",
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.brown@example.com",
      studentId: "STU005",
    },
  ],
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "students-added", students: Student[]): void;
}>();

const isLoading = ref(false);
const selectedStudents = ref<Student[]>([]);
const studentSearchQuery = ref("");
const studentInput = ref<typeof FormInput | null>(null);
const toast = useToast();

// Computed properties
const filteredStudents = computed(() => {
  if (!studentSearchQuery.value.trim()) {
    return props.availableStudents;
  }

  const query = studentSearchQuery.value.toLowerCase();
  return props.availableStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.studentId.toLowerCase().includes(query)
  );
});

const isAllSelected = computed(() => {
  return (
    filteredStudents.value.length > 0 &&
    filteredStudents.value.every((student) => isStudentSelected(student))
  );
});

const isIndeterminate = computed(() => {
  const selectedCount = filteredStudents.value.filter((student) =>
    isStudentSelected(student)
  ).length;
  return selectedCount > 0 && selectedCount < filteredStudents.value.length;
});

// Student selection methods
const handleStudentSearch = () => {
  // Search functionality is handled by computed filteredStudents
};

const isStudentSelected = (student: Student) => {
  return selectedStudents.value.some((s) => s.id === student.id);
};

const toggleStudent = (student: Student) => {
  const index = selectedStudents.value.findIndex((s) => s.id === student.id);
  if (index === -1) {
    selectedStudents.value.push(student);
  } else {
    selectedStudents.value.splice(index, 1);
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Deselect all filtered students
    filteredStudents.value.forEach((student) => {
      const index = selectedStudents.value.findIndex(
        (s) => s.id === student.id
      );
      if (index !== -1) {
        selectedStudents.value.splice(index, 1);
      }
    });
  } else {
    // Select all filtered students
    filteredStudents.value.forEach((student) => {
      if (!isStudentSelected(student)) {
        selectedStudents.value.push(student);
      }
    });
  }
};

// Submit handler
const handleSubmit = async () => {
  if (selectedStudents.value.length === 0) {
    return;
  }

  isLoading.value = true;

  try {
    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1000));

    emit("students-added", selectedStudents.value);
    toast.success(
      `${selectedStudents.value.length} student${
        selectedStudents.value.length !== 1 ? "s" : ""
      } added successfully`
    );

    close();
  } catch (error) {
    console.error("Error adding students:", error);
    toast.error("Failed to add students. Please try again.");
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  selectedStudents.value = [];
  studentSearchQuery.value = "";
};

const close = () => {
  emit("update:modelValue", false);
};

const onOverlayClick = () => {
  if (!props.persistent && !isLoading.value) {
    close();
  }
};

// Reset form when modal closes
watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      resetForm();
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

  .student-details {
    font-size: $text-sm;
    color: $gray-600;
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
        content: "✓";
        position: absolute;
        top: -2px;
        left: 1px;
        color: white;
        font-size: 12px;
        font-weight: bold;
      }
    }

    &:indeterminate {
      background-color: $primary-color-600;
      border-color: $primary-color-600;
      position: relative;

      &::after {
        content: "−";
        position: absolute;
        top: -4px;
        left: 2px;
        color: white;
        font-size: 14px;
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
    padding: 40px 16px;
    text-align: center;
  }

  .empty-message {
    color: $gray-600;
    font-size: $text-sm;
  }
}
</style>
