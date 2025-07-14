<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="modelValue" class="dialog-overlay" @click="onOverlayClick">
        <div class="dialog-container">
          <Transition name="dialog-scale">
            <div
              v-if="modelValue"
              class="dialog"
              @click.stop
              role="dialog"
              aria-modal="true"
            >
              <div class="dialog-header">
                <div class="dialog-icon">
                  <img
                    class="roundedImage"
                    :src="props.selectedEnrollment?.studentImage"
                    :alt="'icon'"
                  />
                </div>
                <div class="student-details">
                  <div class="student-name">
                    {{ props.selectedEnrollment?.studentName }}
                  </div>
                  <div class="student-id">
                    @{{ props.selectedEnrollment?.studentId }}
                  </div>
                </div>
                <div
                  class="status-badge"
                  :class="getStatusClass(props.selectedEnrollment?.status)"
                >
                  <span class="status-dot"></span>
                  {{ capitalizeFirst(props.selectedEnrollment?.status) }}
                </div>
                <div class="registrar-stats">
                  <div class="stat-group">
                    <div class="stat-item">
                      <div class="stat-label">Requested Course</div>
                      <div class="course-arrange">
                        <div
                          class="stat-value profile-count pill p-grey status-badge"
                        >
                          {{ props.selectedEnrollment?.courseCode }}
                        </div>
                        <div
                          v-if="
                            props.selectedEnrollment?.courseStatus === 'CLOSED'
                          "
                          style="text-align: center; margin-left: 10px"
                          class="status-badge status-deactivated"
                        >
                          <span><StatusBadge /></span>
                          {{ props.selectedEnrollment?.courseStatus }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="stat-group">
                    <div class="stat-item">
                      <div class="stat-label">Assigned Registrar</div>
                      <div class="stat-value">
                        <div
                          v-if="props.selectedEnrollment?.assignedRegistrar"
                          style="display: flex"
                          class="student-info profile-count p-grey"
                        >
                          <img
                            :src="
                              props.selectedEnrollment?.assignedRegistrarImage
                            "
                            :alt="props.selectedEnrollment?.assignedRegistrar"
                            class="avatar"
                          />
                          <div class="student-details">
                            <div class="student-name">
                              {{ props.selectedEnrollment?.assignedRegistrar }}
                            </div>
                          </div>
                        </div>
                        <div v-else class="status-badge status-unassigned">
                          Unassigned
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="stat-group">
                    <div class="stat-item">
                      <div class="stat-label">Enrolled Programme</div>
                      <div
                        class="stat-value profile-count pill p-grey status-badge"
                      >
                        <IconsCalendarIcon style="width: 15px" />
                        {{ props.selectedEnrollment?.program }}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="rejection-history"
                  v-if="props.rejectionHistory?.length"
                >
                  <h5 class="recon">Rejection History</h5>
                  <table class="enrollments-table table-container">
                    <thead>
                      <tr>
                        <th class="table-header">S/N</th>
                        <th class="table-header">Reason for Rejection</th>
                        <th class="table-header">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(item, index) in props.rejectionHistory"
                        :key="index"
                        class="table-row"
                      >
                        <td class="table-cell pill p-grey status-badg">
                          0{{ index + 1 }}
                        </td>
                        <td class="table-cell">{{ item.reason }}</td>
                        <td class="table-cell">
                          {{ formatDateToDMY(item.updatedAt) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style="margin-top: 20px" class="dialog-footer">
                  <Button variant="danger" @click="cancel"> Reject </Button>
                  <Button
                    variant="secondary"
                    @click="confirm"
                    :loading="loading"
                  >
                    Approve
                  </Button>
                </div>
                <button
                  class="dialog-close"
                  @click="close"
                  aria-label="Close dialog"
                >
                  <CloseCircleIcon />
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { IconsCalendarIcon } from "#components";
import CloseCircleIcon from "~/components/icons/CloseCircleIcon.vue";
import StatusBadge from "~/components/icons/StatusBadge.vue";
import {
  capitalizeFirst,
  formatDateToDMY,
  getStatusClass,
} from "~/helper/formatData";
import Button from "../ui/Button.vue";
const toast = useToast();

interface Props {
  modelValue: boolean;
  persistent?: boolean;
  loading?: boolean;
  selectedEnrollment?: any;
  rejectionHistory?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  persistent: false,
  loading: false,
});
console.log(props.selectedEnrollment);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "cancel"): void;
  (e: "confirm"): void;
}>();

const close = () => {
  emit("update:modelValue", false);
};

const cancel = () => {
  emit("cancel");
  if (!props.loading) {
    close();
  }
};

const confirm = () => {
  emit("confirm");
  if (!props.loading) {
    close();
  }
};

const onOverlayClick = () => {
  if (!props.persistent && !props.loading) {
    cancel();
  }
};
</script>

<style lang="scss" scoped>
.dialog-select {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .form-label {
    font-weight: 600;
    color: $gray-700;
    margin-bottom: 4px;
  }

  .form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid $border-color;
    border-radius: 12px;
    background-color: white;
    font-size: 1rem;
    font-family: $font-family;
    color: $text-color;

    &:focus {
      border-color: $primary-color;
      outline: none;
    }
  }
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(16, 24, 40, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: auto;
  padding: 16px;
}

.dialog-container {
  max-width: 100%;
  width: 100%;
  max-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog {
  background-color: $white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: calc(100vh - 32px);
  overflow: auto;
  box-shadow: 0px 24px 48px -12px rgba(16, 24, 40, 0.18);
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 12px;

  .dialog-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    position: relative;

    .dialog-icon {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: auto;
        height: 100px;
      }
    }

    .dialog-title {
      font-family: $font-family-heading;
      font-weight: 700;
      font-size: $text-xl;
      color: $gray-800;
      text-align: center;
      margin: 0;
    }

    .dialog-close {
      position: absolute;
      top: 0;
      right: 0;
      background: none;
      border: none;
      color: $gray-500;
      padding: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover {
        background-color: $gray-100;
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }

  .dialog-content {
    overflow-y: auto;

    .dialog-message {
      font-family: $font-family;
      font-size: $text-base;
      color: $gray-600;
      text-align: center;
      margin: 0;
      line-height: 1.6;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    width: 100%;

    > * {
      flex: 1;
      max-width: 80px;
    }

    button {
      border-radius: 12px;
    }
  }
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-scale-enter-active,
.dialog-scale-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.dialog-scale-enter-from,
.dialog-scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
.roundedImage {
  border-radius: 20%;
  width: 100px;
  height: 100px;
}
.student-details {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.student-name {
  font-weight: 600;
}

.student-id {
  font-size: 0.85rem;
  color: #777;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px 1px 6px;
  border-radius: 16px;
  font-size: $text-xxs;
  font-weight: 500;
  line-height: 1.8;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-active {
  background-color: $success-50;
  color: $success-400;
  border: 1px solid $success-400;

  .status-dot {
    background-color: $success-400;
  }
}

.status-unassigned {
  background-color: $warning-50;
  color: $warning-700;
  border: 1px solid $warning-300;

  .status-dot {
    background-color: $primary-color-500;
  }
}

.status-suspended {
  background-color: $primary-color-50;
  color: $primary-color-500;
  border: 1px solid $primary-color-500;

  .status-dot {
    background-color: $primary-color-500;
  }
}

.status-deactivated {
  background-color: $error-50;
  color: $error-700;
  border: 1px solid $error-200;

  .status-dot {
    background-color: $error-400;
  }
}
.registrar-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  flex-wrap: wrap;
  width: 70vw;
  max-width: -webkit-fill-available;
}

.stat-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  width: 70vw;
  // min-width: 79px;
  // max-width: 120px;
}

.stat-item {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: $text-xxs;
  line-height: 1.302;
  color: $gray-500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .card-deactivated & {
    color: $gray-400;
  }
}

.stat-value {
  font-size: $text-sm;
  line-height: 1.43;
  color: $black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .card-deactivated & {
    color: $gray-400;
  }
}
.course-arrange {
  display: flex;
  flex-direction: row;
}
.rejection-history {
  // display: flex;
  // flex-direction: column;
  // align-items: flex-start;
  width: 100%;
}
.enrollments-table {
  max-height: 300px;
  overflow-y: auto;
  border-radius: 20px;
  .courses-cell {
    .core-count {
      display: inline-block;
      margin-left: $spacing-2;
      padding: 2px $spacing-2;
      background-color: $primary-color-100;
      color: $primary-color-700;
      border-radius: 4px;
      font-size: $text-xs;
      font-weight: 500;
    }
  }
}
.status-badg {
  display: inline-flex;
  padding: 5px 10px;
  margin: 10px 10px;
  border-radius: 10px;
}
.recon {
  text-align: left;
}

@media (max-width: $breakpoint-md) {
  .dialog {
    max-width: 100%;
    gap: 16px;
  }
  .enrollments-table {
    border-radius: 20px;
    width: 90vw;
  }
}
</style>
