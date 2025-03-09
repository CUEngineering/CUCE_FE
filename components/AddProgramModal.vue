<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="onOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="modal">
            <div class="modal-header">
              <div class="header-content">
                <h2 class="modal-title">Program Details</h2>
              </div>
              <button class="close-button" @click="close" aria-label="Close">
                <CloseCircleIcon />
              </button>
            </div>

            <div class="modal-body">
              <div class="form-section">
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
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import Button from "./ui/Button.vue";
import CloseCircleIcon from "./icons/CloseCircleIcon.vue";
import FormInput from "./ui/FormInput.vue";
import { useToast } from "~/composables/useToast";

interface Program {
  name: string;
  type: string;
  credits: string;
}

interface ProgramOutput {
  id: number;
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
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  persistent: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "program-added", program: ProgramOutput): void;
}>();

const isLoading = ref(false);
const programTypes = ["Undergraduate", "Masters", "Doctorate"];
const toast = useToast();

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

const validateForm = (): boolean => {
  form.errors.name = !form.data.name ? "Program name is required" : undefined;
  form.errors.type = !form.data.type ? "Program type is required" : undefined;
  return !Object.values(form.errors).some((error) => error !== undefined);
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
      name: form.data.name,
      type: form.data.type,
      credits: form.data.credits,
    };

    emit("program-added", newProgram);
    close();
    // Add success toast
    toast.success(`Program "${form.data.name}" added successfully`);
  } catch (error) {
    console.error("Error adding program:", error);
    // Add error toast
    toast.error("Failed to add program. Please try again.");
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
};

const close = () => {
  emit("update:modelValue", false);
};

const onOverlayClick = () => {
  if (!props.persistent && !isLoading.value) {
    close();
  }
};

// Reset form when modal is closed
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
}
</style>
