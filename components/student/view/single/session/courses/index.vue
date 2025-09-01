<template>
  <div class="component entry student-view-single-session-courses">
    <div class="title">
      <span class="text"> {{ sessionName }} </span>
      <span
        v-if="sessionStatus"
        :class="[
          'status',
          'status-badge',
          getStatusClass(sessionStatus),
        ]"
      >
        {{ capitalizeFirst(sessionStatus) }}
      </span>
    </div>
    <Loader
      v-if="loading"
      class="loader"
    />
    <ul
      v-else-if="courses.length"
      class="body"
    >
      <li
        v-for="(course, index) in courses"
        :key="course.course_id"
        class="course"
      >
        <span class="no">
          {{ String(index + 1).padStart(2, '0') }}
        </span>
        <span class="text">
          {{ course.course_title }}
          <span
            :class="[
              'status',
              'status-badge',
              getStatusClass(courseStatus(course)),
            ]"
          >
            {{ capitalizeFirst(courseStatus(course)) }}
          </span>
        </span>
        <span class="code-unit">
          <span class="code"> {{ course.course_code }} </span>
          <span class="dot" />
          <span class="unit">
            {{ `${course.course_credits} Units` }}
          </span>
        </span>
      </li>
    </ul>
    <UiEmptyState
      v-else
      class="empty"
      title="No Session Courses"
      description="Student is not enrolled for any course in this session"
    >
      <template #icon>
        <img
          src="~/assets/images/EmptyProgram.svg"
          alt=""
          class="empty-state-illustration"
        />
      </template>
      <template
        v-if="authStore.viewerData?.role !== 'STUDENT'"
        #action
      >
        <UiButton
          variant="outline"
          size="sm"
          @click="
            navigateTo({
              name:
                authStore.viewerData?.role === 'ADMIN'
                  ? 'admin-enrollments'
                  : 'registrar-enrollments',
            })
          "
        >
          <template #icon>
            <IconsEyeIcon />
          </template>
          Manage Enrollments
        </UiButton>
      </template>
    </UiEmptyState>
  </div>
</template>

<script setup lang="ts">
import { capitalizeFirst, getStatusClass } from '~/helper/formatData';
import type { StudentCourseListType } from '~/types/course';
import type { SessionDetailType } from '~/types/session';

const props = defineProps<{
  studentId: string | number;
  sessionId: string | number;
  viewer: {
    role: 'ADMIN' | 'REGISTRAR';
    id: string | number;
  };
}>();

const authStore = useAuthStore();
const studentStore = useStudentStore();

const sessionDetailResp = markRaw(
  useAsyncData(
    async function () {
      if (
        !(
          props.sessionId &&
          authStore.role &&
          ['ADMIN', 'REGISTRAR'].includes(authStore.role)
        )
      ) {
        return undefined;
      }

      const resp = await useBackendRequest<{
        status: 'success';
        data: SessionDetailType;
      }>({
        url: `/sessions/${props.sessionId}`,
        validateStatus(status) {
          return status < 400;
        },
      });

      const session = resp.data?.data ?? undefined;
      return session;
    },
    {
      watch: [
        () => authStore.token,
        () => props.sessionId,
        () => props.studentId,
      ],
      deep: false,
      lazy: false,
      immediate: false,
      default() {
        return undefined;
      },
      getCachedData(key) {
        const session = getCacheFromState<SessionDetailType>(key);

        if (session) {
          return session;
        }

        return undefined;
      },
    },
  ),
);

const courses = computed(
  () => studentStore.studentSessionCoursesResp.data.value ?? [],
);

const loading = computed(() => {
  const loadingStatus =
    studentStore.studentSessionCoursesResp.status.value;
  if (loadingStatus === 'pending' && !courses.value.length) {
    return true;
  }

  return false;
});

watch(
  [() => props.studentId, () => props.sessionId],
  async ([studentId, sessionId]) => {
    studentId = String(studentId);
    sessionId = String(sessionId);

    if (studentId && sessionId) {
      if (
        studentId === studentStore.selectedStudentId &&
        sessionId === studentStore.selectedStudentSessionId
      ) {
        await Promise.all([
          studentStore.studentSessionCoursesResp.refresh({
            dedupe: 'cancel',
          }),
          sessionDetailResp.refresh({
            dedupe: true,
          }),
        ]);
      } else {
        await Promise.all([
          studentStore.studentSessionCoursesResp.clear(),
          sessionDetailResp.clear(),
        ]);

        studentStore.selectedStudentId = studentId;
        studentStore.selectedStudentSessionId = sessionId;
        await Promise.all([
          studentStore.studentSessionCoursesResp.execute({
            dedupe: 'cancel',
          }),
          sessionDetailResp.execute({
            dedupe: true,
          }),
        ]);
      }
    }
  },
  {
    immediate: true,
  },
);

onBeforeUnmount(() => {
  studentStore.selectedStudentSessionId = 'all';
});

const sessionName = computed(
  () => sessionDetailResp.data.value?.session_name ?? 'Session',
);

const sessionStatus = computed(
  () => sessionDetailResp.data.value?.session_status ?? '',
);

const courseStatus = computed(() => {
  const sessionCourses = (
    sessionDetailResp.data.value?.session_courses ?? []
  ).map((sc) => {
    sc.course_id = String(sc.course_id);
    return sc;
  });

  return (course: StudentCourseListType) => {
    const foundSessionCourse = sessionCourses.find(
      (sc) => sc.course_id === String(course.course_id),
    );
    return foundSessionCourse?.status ?? course.availability_status;
  };
});
</script>

<style lang="scss" scoped>
.component.entry.student-view-single-session-courses {
  display: flex;
  width: 100%;
  min-height: 100%;
  flex-direction: column;
  align-items: flex-start;
  align-items: center;

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

  > * {
    display: flex;
    width: 100%;
  }

  > .loader {
    width: auto;
  }

  > .title {
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    column-gap: 10px;
    padding: 10px 15px;

    > .text {
      font-size: 14px;
      font-weight: 900;
      color: #14181d;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  > .body {
    list-style-type: none;
    flex-direction: column;
    row-gap: 10px;
    margin: 20px 0 0 0;
    overflow: hidden;
    overflow-y: auto;

    > .course {
      display: flex;
      align-items: center;
      padding: 10px;
      border-radius: 15px;
      border: 1px solid #f2f4f7;

      > .no,
      > .text,
      > .code-unit {
        display: inline-flex;
        color: #475467;
        align-items: center;
      }

      > .no {
        padding: 5px;
        border-radius: 10px;
        border: 1px solid #f2f4f7;
        font-size: 13px;
      }

      > .text {
        font-size: 16px;
        font-weight: 900;
        color: #14181d;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin: 0 0 0 10px;
        column-gap: 20px;
      }

      > .code-unit {
        margin: 0 0 0 auto;
        column-gap: 10px;

        > .code {
          text-transform: uppercase;
        }

        > .dot {
          display: inline-flex;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #475467;
        }

        > .unit {
          text-transform: capitalize;
        }
      }
    }
  }
}
</style>
