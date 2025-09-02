<template>
  <UiDialog
    v-if="authStore.role === 'REGISTRAR'"
    v-model="isShowing"
    title="Claim Student?"
    message="Do you want to be the registrar of this student for this current session?"
    variant="warning"
    :loading="isLoading"
    confirm-button-text="Yes / Claim"
    @confirm="handleSubmit"
  />
  <Teleport
    v-else-if="authStore.role === 'ADMIN'"
    to="body"
  >
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
                <p class="">{{ modalSubTitle }}</p>
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
                <UiFormSelect
                  id="registrars"
                  v-model="selectedRegistrarId"
                  label="Registrar"
                  placeholder="Select registrar"
                  type="string"
                  :options="registrarsList"
                  required
                  :error="undefined"
                />
              </div>
            </div>

            <div class="modal-footer">
              <UiButton
                :disabled="isLoading"
                variant="secondary"
                @click="close"
              >
                Cancel
              </UiButton>
              <UiButton
                variant="primary"
                :disabled="isLoading"
                :loading="isLoading"
                @click="handleSubmit"
              >
                {{ submitButtonText }}
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { isAxiosError } from 'axios';
import { capitalize, isArray, orderBy } from 'lodash-es';
import { computed, ref } from 'vue';
import type { RegistrarType } from '~/types/registrar';
import type { StudentWithRegistrar } from '~/types/student';

interface Props {
  modelValue: boolean;
  loading?: boolean;
  persistent?: boolean;
  mode?: 'claim' | 'update-claim';
  student: StudentWithRegistrar;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  persistent: false,
  mode: 'claim',
});

const emit = defineEmits<{
  (e: 'update:modelValue' | 'update:loading', value: boolean): void;
  (e: 'update' | 'close'): void;
}>();

const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

const isShowing = computed({
  get() {
    return props.modelValue;
  },
  set(val: boolean) {
    if (!val) {
      close();
    }
  },
});

const localisLoading = ref(false);
const isLoading = computed({
  get() {
    return localisLoading.value
      ? localisLoading.value
      : props.loading;
  },
  set(val: boolean) {
    localisLoading.value = val;
    emit('update:loading', val);
  },
});

const studentStore = useStudentStore();
const authStore = useAuthStore();
const toast = useToast();

const localMode = computed(() =>
  authStore.role === 'REGISTRAR'
    ? 'claim'
    : authStore.role === 'ADMIN'
      ? props.mode
      : undefined,
);

watch(
  localMode,
  (mode) => {
    if (!mode) {
      emit('close');
      emit('update:modelValue', false);
    }
  },
  {
    immediate: true,
  },
);

const registrarResp = useAsyncData(
  async () => {
    if (authStore.role !== 'ADMIN') {
      return [];
    }

    const resp = await useBackendRequest<{
      status: 'success';
      data: RegistrarType[];
    }>({
      url: `/registrars`,
      validateStatus(status) {
        return status < 400;
      },
    });

    const registrars = resp.data?.data ?? [];
    return registrars;
  },
  {
    watch: [() => authStore.token],
    deep: false,
    lazy: true,
    immediate: true,
    default() {
      return [] as RegistrarType[];
    },
    transform(list) {
      return orderBy(
        list,
        [(r) => `${r.first_name} ${r.last_name}`, (r) => r.email],
        ['asc', 'asc'],
      );
    },
    getCachedData(key) {
      const list = getCacheFromState<RegistrarType[]>(key);

      if (isArray(list)) {
        return list;
      }

      return undefined;
    },
  },
);

const registrarsList = computed(() => {
  switch (authStore.role) {
    case 'REGISTRAR': {
      return [
        {
          label: capitalize(
            `${authStore.user?.first_name} ${authStore.user?.last_name}`,
          ),
          value: String(authStore.user?.registrar_id || ''),
        },
      ];
    }

    case 'ADMIN': {
      return (registrarResp.data.value ?? []).map((r) => {
        return {
          label: capitalize(`${r.first_name} ${r.last_name}`),
          value: String(r.registrar_id || ''),
        };
      });
    }

    default: {
      return [];
    }
  }
});

const selectedRegistrarId = ref<string>('');

watchEffect(() => {
  if (!selectedRegistrarId.value && registrarsList.value.length) {
    switch (authStore.role) {
      case 'REGISTRAR': {
        selectedRegistrarId.value =
          registrarsList.value[0]?.value ?? '';
        break;
      }

      case 'ADMIN': {
        const list = registrarResp.data.value;
        if (list.length) {
          const adminRegistrar = list.find(
            (r) =>
              String(r.email).toLowerCase() ===
              String(authStore.user?.email ?? '').toLowerCase(),
          );

          if (adminRegistrar) {
            selectedRegistrarId.value = String(
              adminRegistrar.registrar_id,
            );
          } else {
            selectedRegistrarId.value =
              registrarsList.value[0]?.value ?? '';
          }
        }
      }
    }
  }
});

const studentName = computed(() =>
  capitalize(
    `${props.student.first_name} ${props.student.last_name}`,
  ),
);

// Computed properties
const modalTitle = computed(() => {
  switch (localMode.value) {
    case 'claim':
      return 'Claim Student';
    case 'update-claim':
      return 'Update Student Claim';
    default:
      return '';
  }
});

const modalSubTitle = computed(() => {
  switch (localMode.value) {
    case 'claim':
      return authStore.role === 'ADMIN'
        ? 'Select a registrar to assign student to'
        : '';
    case 'update-claim':
      return 'Select a new registrar to assign student to';
    default:
      return '';
  }
});

const submitButtonText = computed(() => {
  switch (localMode.value) {
    case 'claim':
      return 'Save';
    case 'update-claim':
      return 'Update';
    default:
      return '';
  }
});

// Submit handler
const handleSubmit = async () => {
  if (!selectedRegistrarId.value) {
    return;
  }

  isLoading.value = true;

  const payload = {
    registrar_id: selectedRegistrarId.value,
  };

  try {
    const resp = await useBackendRequest<{
      status: 'success';
    }>({
      url: `/students/${props.student.student_id}/claim`,
      method: 'post',
      data: payload,
      validateStatus(status) {
        return status < 400;
      },
    });

    if (resp.status === 204) {
      await Promise.all([
        studentStore.studentResp.refresh({ dedupe: true }),
        studentStore.sessionStudentsResp.refresh({ dedupe: true }),
        studentStore.allStudentsResp.refresh({ dedupe: true }),
      ]);

      toast.success(
        `Student ${studentName.value} has been claimed successfully`,
      );
    }

    close();
  } catch (error: unknown) {
    let errMessage = isAxiosError(error)
      ? error.response?.data?.message
      : '';
    if (!errMessage) {
      errMessage = `Failed to clain student. Please try again.`;
    }

    console.error('Submission error:', error);
    toast.error(errMessage);
  } finally {
    isLoading.value = false;
  }
};

const onOverlayClick = () => {
  if (!props.persistent && !isLoading.value) {
    close();
  }
};
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
