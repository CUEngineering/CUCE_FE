<template>
  <Dialog
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    title="Add New Programme"
    :show-close-button="true"
    persistent
    :loading="isLoading"
    @confirm="handleSubmit"
    confirm-button-text="Add Programme"
  >
    <div class="add-program-form">
      <FormInput
        id="program-name"
        label="Programme Name"
        v-model="formData.name"
        placeholder="Enter programme name"
        required
        :error="errors.name"
      />

      <div class="form-row">
        <FormInput
          id="enrolled-students"
          label="Enrolled Students"
          v-model="formData.enrolledStudents"
          type="number"
          placeholder="0"
          :error="errors.enrolledStudents"
        />

        <FormInput
          id="credits"
          label="Total Credits"
          v-model="formData.credits"
          type="number"
          placeholder="0"
          :error="errors.credits"
        />
      </div>

      <div class="form-row">
        <FormInput
          id="courses"
          label="Total Courses"
          v-model="formData.courses"
          type="number"
          placeholder="0"
          :error="errors.courses"
        />

        <FormInput
          id="core-count"
          label="Core Courses"
          v-model="formData.coreCount"
          type="number"
          placeholder="0"
          :error="errors.coreCount"
        />
      </div>

      <div class="form-field">
        <label for="program-type" class="form-label">Programme Type</label>
        <select
          id="program-type"
          v-model="formData.type"
          class="form-select"
          :class="{ 'has-error': errors.type }"
        >
          <option value="" disabled>Select programme type</option>
          <option value="Undergraduate">Undergraduate</option>
          <option value="Masters">Masters</option>
          <option value="Doctorate">Doctorate</option>
        </select>
        <p v-if="errors.type" class="input-error">{{ errors.type }}</p>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import Dialog from "~/components/ui/Dialog.vue";
import FormInput from "~/components/ui/FormInput.vue";

interface Program {
  id?: number;
  name: string;
  enrolledStudents: string;
  courses: string;
  coreCount: string;
  type: string;
  credits: string;
}

interface ProgramOutput {
  id: number;
  name: string;
  enrolledStudents: number;
  courses: number;
  coreCount: number;
  type: string;
  credits: number;
}

interface Errors {
  name?: string;
  enrolledStudents?: string;
  courses?: string;
  coreCount?: string;
  type?: string;
  credits?: string;
}

interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "program-added", program: ProgramOutput): void;
}>();

const isLoading = ref(false);
const formData = reactive<Program>({
  name: "",
  enrolledStudents: "",
  courses: "",
  coreCount: "",
  type: "",
  credits: "",
});

const errors = reactive<Errors>({});

const validateForm = (): boolean => {
  errors.name = !formData.name ? "Programme name is required" : undefined;
  errors.type = !formData.type ? "Programme type is required" : undefined;

  // Convert string inputs to numbers for validation
  if (formData.enrolledStudents && isNaN(Number(formData.enrolledStudents))) {
    errors.enrolledStudents = "Must be a valid number";
  }

  if (formData.courses && isNaN(Number(formData.courses))) {
    errors.courses = "Must be a valid number";
  }

  if (formData.coreCount && isNaN(Number(formData.coreCount))) {
    errors.coreCount = "Must be a valid number";
  }

  if (formData.credits && isNaN(Number(formData.credits))) {
    errors.credits = "Must be a valid number";
  }

  return !Object.values(errors).some((error) => error !== undefined);
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;

  try {
    // In a real application, you would make an API call here
    // For now, we'll just simulate a network request
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newProgram: ProgramOutput = {
      id: Math.floor(Math.random() * 1000), // Generate a random ID for demo purposes
      name: formData.name,
      enrolledStudents: Number(formData.enrolledStudents) || 0,
      courses: Number(formData.courses) || 0,
      coreCount: Number(formData.coreCount) || 0,
      type: formData.type,
      credits: Number(formData.credits) || 0,
    };

    emit("program-added", newProgram);
    resetForm();
  } catch (error) {
    console.error("Error adding program:", error);
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  formData.name = "";
  formData.enrolledStudents = "";
  formData.courses = "";
  formData.coreCount = "";
  formData.type = "";
  formData.credits = "";

  Object.keys(errors).forEach((key) => {
    delete errors[key as keyof Errors];
  });
};
</script>

<style lang="scss" scoped>
.add-program-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-6;
  padding: $spacing-2 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-4;

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}

.form-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: block;
  font-family: $font-family;
  font-weight: 500;
  color: $text-color;
  font-size: $text-sm;
}

.form-select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid $border-color;
  border-radius: 12px;
  font-family: $font-family;
  font-size: $text-base;
  color: $text-color;
  background-color: white;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%23667085' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
  }

  &.has-error {
    border-color: $error-500;

    &:focus {
      box-shadow: 0 0 0 2px rgba($error-500, 0.1);
    }
  }
}

.input-error {
  font-family: $font-family;
  font-size: $text-sm;
  color: $error-500;
  margin: 0;
  line-height: 1.5;
}
</style>
