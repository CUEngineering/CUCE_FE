<template>
  <div class="student-page dashlet-wrapper">
    <div class="page-header dashlet">
      <div class="page-title">
        <button
          class="back-icon"
          @click="back"
        >
          <IconsChevronLeftIcon />
        </button>
        <h2 class="heading-txt">{{ pageTitle }}</h2>
      </div>
    </div>

    <Loader v-if="loading" />

    <div
      v-if="!loading && student"
      class="wrapper"
    >
      <div
        v-show="showStudentDetailsElement"
        class="dashlet biodata"
      >
        <div class="accordion">
          <div class="title">
            <span class="text"> Personal Information </span>
          </div>
          <div class="body">
            <div class="row">
              <div class="picture-name">
                <img
                  :src="
                    student.profile_picture ??
                    `https://lccvdfvlczhicqnrelsv.supabase.co/storage/v1/object/public/cuce/static/default.png`
                  "
                  :alt="student.reg_number"
                  class="avatar"
                />
                <div class="name-wrapper">
                  <div class="name">
                    {{ student.first_name }}{{ ' '
                    }}{{ student.last_name }}
                  </div>
                  <div class="regnumber">
                    @{{ student.reg_number }}
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="student.can_claim || viewer.role === 'ADMIN'"
              class="row actions"
            >
              <UiButton
                v-if="student.can_claim"
                variant="primary"
                size="sm"
                @click="studentStore.isShowingClaimModal = true"
              >
                <template #icon>
                  <IconsAcademicCapIcon />
                </template>
                Claim Student
              </UiButton>
              <template v-if="viewer.role === 'ADMIN'">
                <UiButton
                  variant="outline"
                  size="sm"
                  @click="viewProgramCourses"
                >
                  <template #icon>
                    <IconsEyeIcon />
                  </template>
                  View Program Courses
                </UiButton>
                <UiButton
                  variant="yellow"
                  size="sm"
                  @click="studentStore.isShowingSuspendModal = true"
                >
                  <template #icon>
                    <IconsCloseCircleIcon />
                  </template>
                  Suspend Account
                </UiButton>
                <UiButton
                  variant="danger"
                  size="sm"
                  @click="studentStore.isShowingDeleteModal = true"
                >
                  <template #icon>
                    <IconsTrashIcon />
                  </template>
                  Remove Account
                </UiButton>
              </template>
            </div>
          </div>
        </div>
        <div
          :class="[
            'accordion',
            'basic-info',
            { hidden: !shownAccordions.basic },
          ]"
        >
          <div
            class="title"
            @click.stop="
              shownAccordions.basic = !shownAccordions.basic
            "
          >
            <span class="text"> Basic Details </span>
            <span class="icon">
              <IconsChevronDownIcon />
            </span>
          </div>
          <div class="body">
            <div class="row">
              <div class="email-wrapper">
                <div class="label">
                  <span class="text"> Email Address </span>
                </div>
                <div class="value">
                  <span class="icon"> <IconsBookOpenIcon /> </span>
                  <span class="text">
                    {{ student.email }}
                  </span>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="program-name-wrapper">
                <div class="label">
                  <span class="text"> Enrolled Programme </span>
                </div>
                <div class="value">
                  <span class="icon"> <IconsAcademicCapIcon /> </span>
                  <span class="text">
                    {{
                      capitalizeFirst(student.program.program_name)
                    }}
                  </span>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="program-type-wrapper">
                <div class="label">
                  <span class="text"> Programme Type </span>
                </div>
                <div class="value">
                  <span
                    :class="[
                      'status-badge',
                      getStatusClass(student.program.program_type),
                    ]"
                  >
                    {{
                      capitalizeFirst(student.program.program_type)
                    }}
                  </span>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="total-courses-wrapper">
                <div class="label">
                  <span class="text">
                    Total Courses In Programme
                  </span>
                </div>
                <div class="value">
                  <span class="icon"> <IconsDocumentIcon /> </span>
                  <span class="text">
                    {{ student.program_course_count }}
                  </span>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="assigned-registrar-wrapper">
                <div class="label">
                  <span class="text"> Assigned Registrar </span>
                </div>
                <div class="value">
                  <template v-if="student.registrar">
                    <img
                      :src="
                        student.registrar?.profile_picture ??
                        `https://lccvdfvlczhicqnrelsv.supabase.co/storage/v1/object/public/cuce/static/default.png`
                      "
                      :alt="`${student.registrar?.first_name} ${student.registrar?.last_name}`"
                      class="avatar"
                    />
                    <div class="name">
                      {{ student.registrar?.first_name }}
                      {{ student.registrar?.last_name }}
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          :class="[
            'accordion',
            'enrolled-sessions',
            { hidden: !shownAccordions.enrolledSessions },
          ]"
        >
          <div
            class="title"
            @click.stop="
              shownAccordions.enrolledSessions =
                !shownAccordions.enrolledSessions
            "
          >
            <span class="text"> Enrolled Sessions </span>
            <span class="icon">
              <IconsChevronDownIcon />
            </span>
          </div>
          <div class="body">
            <Loader v-if="loadingEnrolledSessions" />
            <template v-else-if="enrolledSessions.length">
              <div
                v-for="session in enrolledSessions"
                :key="session.session_id"
                :class="['row', { active: isSessionActive(session) }]"
                title="Click to view session courses"
                @click="viewSessionCourses(session)"
              >
                <div class="wrapper">
                  <div class="date">
                    <span class="icon">
                      <IconsCalendarIcon />
                    </span>
                    <span class="text">
                      {{
                        `${formatDateToDateAndTime(session.start_date)} - ${formatDateToDateAndTime(session.end_date)}`
                      }}
                    </span>
                  </div>
                  <div class="name-status">
                    <div class="name">{{ session.session_name }}</div>
                    <span
                      :class="[
                        'status',
                        'status-badge',
                        getStatusClass(session.session_status),
                      ]"
                    >
                      {{ capitalizeFirst(session.session_status) }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
            <UiEmptyState
              v-else
              class="empty"
              title="No Enrolled Session yet"
              description="Student has not been enrolled in any session yet"
            >
              <template #icon>
                <img
                  src="~/assets/images/EmptyProgram.svg"
                  alt=""
                  class="empty-state-illustration"
                />
              </template>
            </UiEmptyState>
          </div>
        </div>
      </div>

      <div
        v-show="showCoursesElement"
        class="dashlet session-courses"
      >
        <Suspense>
          <template #default>
            <LazyNuxtPage />
          </template>
          <template #pending>
            <Loader />
          </template>
        </Suspense>
        <UiButton
          v-if="showHoveringBackButton"
          class="hovering-back-button"
          variant="outline"
          size="sm"
          title="Go back"
          @click="back"
        >
          <IconsCloseIcon />
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import {
  capitalizeFirst,
  formatDateToDateAndTime,
  getStatusClass,
} from '~/helper/formatData';
import type { StudentSessionType } from '~/types/session';

const props = defineProps<{
  student_id: string | number;
  viewer: {
    role: 'ADMIN' | 'REGISTRAR';
    id: string | number;
  };
}>();

const studentStore = useStudentStore();
const router = useRouter();
const studentId = computed(() => {
  return props.student_id;
});

const pageTitle = computed(() => {
  switch (router.currentRoute.value.name) {
    case 'admin-students-studentId-program-courses':
    case 'registrar-students-studentId-program-courses': {
      return 'Student Program Courses';
    }

    case 'admin-students-studentId-sessions-sessionId-courses':
    case 'registrar-students-studentId-sessions-sessionId-courses': {
      return 'Student Session Courses';
    }

    default: {
      return `Student Details`;
    }
  }
});

const back = () => {
  if (!studentId.value) {
    return;
  }

  switch (router.currentRoute.value.name) {
    case 'admin-students-studentId-program-courses':
    case 'admin-students-studentId-sessions-sessionId-courses': {
      return navigateTo({
        name: 'admin-students-studentId',
        params: {
          studentId: studentId.value,
        },
      });
    }

    case 'registrar-students-studentId-program-courses':
    case 'registrar-students-studentId-sessions-sessionId-courses': {
      return navigateTo({
        name: 'registrar-students-studentId',
        params: {
          studentId: studentId.value,
        },
      });
    }

    default: {
      return navigateTo({
        name:
          props.viewer.role === 'ADMIN'
            ? 'admin-students'
            : 'registrar-students',
      });
    }
  }
};

const viewProgramCourses = () => {
  switch (props.viewer.role) {
    case 'ADMIN': {
      return navigateTo({
        name: 'admin-students-studentId-program-courses',
        params: {
          studentId: props.student_id,
        },
      });
    }

    case 'REGISTRAR': {
      return navigateTo({
        name: 'registrar-students-studentId-program-courses',
        params: {
          studentId: props.student_id,
        },
      });
    }
  }
};

const viewSessionCourses = (session: StudentSessionType) => {
  switch (props.viewer.role) {
    case 'ADMIN': {
      return navigateTo({
        name: 'admin-students-studentId-sessions-sessionId-courses',
        params: {
          studentId: props.student_id,
          sessionId: session.session_id,
        },
      });
    }

    case 'REGISTRAR': {
      return navigateTo({
        name: 'registrar-students-studentId-sessions-sessionId-courses',
        params: {
          studentId: props.student_id,
          sessionId: session.session_id,
        },
      });
    }
  }
};

const showHoveringBackButton = computed(() =>
  [
    'admin-students-studentId-program-courses',
    'admin-students-studentId-sessions-sessionId-courses',
    'registrar-students-studentId-program-courses',
    'registrar-students-studentId-sessions-sessionId-courses',
  ].includes(router.currentRoute.value.name),
);

const student = computed(
  () => studentStore.studentResp.data.value ?? undefined,
);

const loading = computed(() => {
  const loadingStatus = studentStore.studentResp.status.value;
  if (loadingStatus === 'pending' && !student.value) {
    return true;
  }

  return false;
});

watch(
  studentId,
  async (studentId) => {
    if (studentId) {
      if (studentId !== studentStore.selectedStudentId) {
        await Promise.all([
          studentStore.studentResp.clear(),
          studentStore.studentSessionsResp.clear(),
        ]);

        studentStore.selectedStudentId = studentId;
        await Promise.all([
          studentStore.studentResp.execute({
            dedupe: 'cancel',
          }),
          studentStore.studentSessionsResp.execute({
            dedupe: 'cancel',
          }),
        ]);
      } else {
        await Promise.all([
          studentStore.studentResp.refresh({
            dedupe: 'cancel',
          }),
          studentStore.studentSessionsResp.refresh({
            dedupe: 'cancel',
          }),
        ]);
      }
    }
  },
  {
    immediate: true,
  },
);

const shownAccordions = reactive({
  personal: true,
  basic: true,
  enrolledSessions: true,
});

const enrolledSessions = computed(
  () => studentStore.studentSessionsResp.data.value ?? [],
);

const loadingEnrolledSessions = computed(() => {
  const loadingStatus = studentStore.studentSessionsResp.status.value;
  if (loadingStatus === 'pending' && !enrolledSessions.value.length) {
    return true;
  }

  return false;
});

const isSessionActive = computed(() => {
  const routeName = router.currentRoute.value.name;
  const sessionId = String(
    routeName ===
      'admin-students-studentId-sessions-sessionId-courses' ||
      routeName ===
        'registrar-students-studentId-sessions-sessionId-courses'
      ? router.currentRoute.value.params.sessionId
      : '',
  );

  return (session: StudentSessionType) => {
    return String(session.session_id) === sessionId;
  };
});

const isMobileView = useMediaQuery(`(max-width: 768px)`);
const showStudentDetailsElement = computed(
  () => !(showHoveringBackButton.value && isMobileView.value),
);

const showCoursesElement = computed(() => {
  if (!isMobileView.value) {
    return true;
  }

  return showHoveringBackButton.value;
});
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .page-title {
    display: flex;
    align-items: center;
    gap: $spacing-2;
  }

  .back-icon {
    background: none;
    border: none;
    color: $gray-900;
    cursor: pointer;
    width: 20px;
    height: 20px;
  }

  .header-actions {
    display: flex;
    gap: $spacing-4;
  }
}

/* ====================
   Status Badge
   ==================== */
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

.student-page > .wrapper {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  justify-content: space-between;
  align-items: flex-start;
  column-gap: 12px;

  > * {
    display: flex;
    width: calc(50% - 6px);
    flex-shrink: 0;
    flex-grow: 1;
    height: calc(100vh - 170px);
    overflow: hidden;
    overflow-y: auto;
  }

  > .biodata {
    flex-direction: column;
    align-items: stretch;
    row-gap: 30px;

    > .accordion {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      width: 100%;

      > .title,
      > .body {
        display: flex;
        width: 100%;
      }

      > .title {
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;
        border-radius: 10px;
        background-color: #f9fafb;
        padding: 10px 15px;

        > .text {
          font-size: 14px;
          font-weight: 900;
          color: #475467;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        > .icon {
          display: inline-flex;
          align-items: center;

          :deep() {
            > svg {
              transition: all 0.3s ease-in-out;
              transform: rotate(180deg);
            }
          }
        }
      }

      > .body {
        display: flex;
        flex-direction: column;
        align-items: stretch;

        > .row {
          display: flex;
          margin: 20px 0 0 0;
          flex-wrap: nowrap;

          > .picture-name {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;

            > img {
              width: 70px;
              height: 70px;
              object-fit: cover;
              border-radius: 50%;
            }

            > .name-wrapper {
              display: inline-flex;
              margin: 0 0 0 20px;
              flex-direction: column;
              row-gap: 10px;

              > .name {
                font-size: 18px;
                font-weight: 900;
                color: #000000;
                text-transform: capitalize;
              }

              > .regnumber {
                font-size: 16px;
                font-weight: 400;
                color: #667085;
              }
            }
          }
        }

        > .row.actions {
          column-gap: 15px;
          row-gap: 10px;

          :deep() {
            > * {
              width: auto;
            }
          }
        }
      }

      &.basic-info {
        > .body {
          padding: 0 20px;

          > .row > div {
            display: flex;
            width: 100%;
            flex-wrap: nowrap;
            align-items: center;
            column-gap: 20px;

            > .label {
              display: inline-flex;
              justify-content: space-between;
              align-items: center;
              width: 40%;

              &::after {
                content: ':';
                display: inline-flex;
              }

              > .text {
                font-size: 13px;
                color: #667085;
              }
            }

            > .value {
              display: inline-flex;
              flex-grow: 1;
              justify-content: flex-start;
              align-items: center;
              column-gap: 4px;

              > .icon {
                display: inline-flex;
                align-items: center;

                :deep() {
                  > svg {
                    width: 14px;
                    height: 14px;
                    color: #344054;
                  }
                }
              }
            }

            &.assigned-registrar-wrapper {
              > .value {
                background-color: #eaecf0;
                padding: 4px 8px;
                border-radius: 8px;
                column-gap: 5px;
                width: auto;
                flex-grow: 0;

                > .avatar {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  object-fit: scale-down;
                }

                > .name {
                  color: #475467;
                  font-size: 14px;
                  text-overflow: ellipsis;
                  text-transform: capitalize;
                }
              }
            }
          }
        }
      }

      &.enrolled-sessions {
        > .body {
          > .row {
            flex-direction: column;
            border-radius: 25px;
            border: 1px solid #f2f4f7;
            padding: 10px 14px;
            margin: 10px 0 0 0;
            cursor: pointer;
            transition: all 0.3s ease-in-out;

            > .wrapper {
              display: flex;
              flex-direction: column;
              transition: all 0.3s ease-in-out;
              border-left: 2px solid #eaecf0;
              padding: 6px 13px;
              row-gap: 10px;
              width: 100%;

              > .date {
                display: flex;
                width: 100%;
                align-items: center;
                column-gap: 10px;

                > .icon {
                  display: inline-flex;
                  align-items: center;

                  :deep() {
                    > svg {
                      width: 14px;
                      height: 14px;
                      color: #344054;
                    }
                  }
                }

                > .text {
                  font-size: 14px;
                  font-weight: 400;
                  color: #475467;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                }
              }

              > .name-status {
                display: flex;
                flex-wrap: nowrap;
                align-items: center;
                column-gap: 20px;

                > * {
                  display: inline-flex;
                  align-items: center;
                }

                > .name {
                  font-size: 14px;
                  font-weight: 700;
                  color: #000000;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                }
              }
            }

            &.active {
              background-color: #dbfbfe;
            }

            &:hover {
              background-color: #e9fdff;
            }

            &.active,
            &:hover {
              > .wrapper {
                border-left: 2px solid #2a50ad;
              }
            }
          }
        }
      }

      &.hidden {
        > .title {
          > .icon {
            :deep() {
              > svg {
                transform: rotate(0deg);
              }
            }
          }
        }

        > .body {
          display: none;
        }
      }
    }
  }

  > .session-courses {
    position: relative;

    > .hovering-back-button {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      padding: 0;

      :deep() {
        > .text {
          display: inline-flex;
          align-items: center;
        }
      }
    }
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;

    > * {
      width: 100%;
      height: calc(100vh - 150px);
    }
  }
}

@media (max-width: 768px) {
  .web-table {
    display: none;
  }
  .web {
    display: none;
  }

  .mobile-table {
    display: block;
  }
}
</style>
