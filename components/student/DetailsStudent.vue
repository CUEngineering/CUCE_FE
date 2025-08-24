<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="modelValue"
        class="dialog-overlay"
        @click="onOverlayClick"
      >
        <div class="dialog-container">
          <Transition name="dialog-scale">
            <div
              v-if="modelValue"
              class="dialog"
              role="dialog"
              aria-modal="true"
              @click.stop
            >
              <div class="dialog-header">
                <div class="dialog-icon">
                  {{ course.course_code }}
                </div>

                <div
                  class="status-badge"
                  :class="getStatusClass(course.availability_status)"
                >
                  <span class="status-dot"></span>
                  {{ capitalizeFirst(course.availability_status) }}
                </div>

                <p style="font-weight: bold">
                  {{ course.course_title }}
                </p>
                <div style="display: flex; align-items: center">
                  <div style="margin-right: 5px">
                    {{ course.course_code }}
                  </div>
                  <Dot />
                  <div style="margin-left: 5px">
                    {{ course.course_credits }}{{ ' ' }}Units
                  </div>
                </div>
                <p>
                  {{ course.course_desc }}
                </p>
                <div
                  v-if="course.student_course_enrollements.length"
                  class="rejection-history"
                >
                  <h5 class="recon">Enrollment History</h5>
                  <table class="enrollments-table table-container">
                    <thead>
                      <tr>
                        <th class="table-header">S/N</th>
                        <th class="table-header">Date</th>
                        <th class="table-header">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(
                          enrollment, index
                        ) in course.student_course_enrollements"
                        :key="index"
                        :class="[
                          `table-row`,
                          getStatusClass(
                            enrollment.enrollment_status,
                          ),
                        ]"
                      >
                        <td
                          class="table-cell pill p-grey status-badg"
                        >
                          0{{ index + 1 }}
                        </td>
                        <td class="table-cell">
                          {{
                            formatDateToDateAndTime(
                              enrollment.updated_at,
                            )
                          }}
                        </td>
                        <td class="table-cell">
                          <template
                            v-if="
                              enrollment.enrollment_status ===
                              'PENDING'
                            "
                          >
                            pending
                          </template>
                          <template
                            v-else-if="
                              enrollment.enrollment_status ===
                              'REJECTED'
                            "
                          >
                            {{ enrollment.rejection_reason }}
                          </template>
                          <template v-else> Enrolled </template>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div
                  v-if="showButton === true"
                  style="margin-top: 20px"
                  class="dialog-footer"
                >
                  <div v-if="course.can_enroll">
                    <Button
                      variant="secondary"
                      @click="enroll"
                    >
                      <template
                        v-if="
                          course.student_course_enrollements.length
                        "
                      >
                        re-Enroll
                      </template>
                      <template v-else> Enroll </template>
                    </Button>
                  </div>

                  <div v-else-if="course.can_request">
                    <Button
                      variant="yellow"
                      @click="request"
                    >
                      Request
                    </Button>
                  </div>
                </div>
                <button
                  class="dialog-close"
                  aria-label="Close dialog"
                  @click="close"
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
import CloseCircleIcon from '~/components/icons/CloseCircleIcon.vue';
import {
  capitalizeFirst,
  formatDateToDateAndTime,
  getStatusClass,
} from '~/helper/formatData';
import Dot from '../icons/Dot.vue';
import Button from '../ui/Button.vue';
import type { StudentCourseListType } from '~/types/course';

interface Props {
  modelValue: boolean;
  persistent?: boolean;
  loading?: boolean;
  course: StudentCourseListType;
  showButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  persistent: false,
  loading: false,
  showButton: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'enroll' | 'request' | 'close'): void;
}>();

const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

const enroll = () => {
  emit('enroll');
  if (!props.loading) {
    close();
  }
};

const request = () => {
  emit('request');
  if (!props.loading) {
    close();
  }
};

const onOverlayClick = () => {
  if (!props.persistent && !props.loading) {
    close();
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
  background-image: url('~/assets/images/StudentBack.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
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
      background-image: url('~/assets/images/HOLDER.svg');
      background-repeat: no-repeat;
      background-position: center;
      width: 200px;
      height: 100px;
      //   border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
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
    justify-content: center;
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
  transition:
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
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
