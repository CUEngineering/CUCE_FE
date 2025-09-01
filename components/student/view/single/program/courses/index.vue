<template>
  <div class="component entry student-view-single-program-courses">
    <div class="title">
      <span class="text"> Student Program Courses </span>
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
      title="No Program Courses"
      description="Student program doesnt have any course yet."
    >
      <template #icon>
        <img
          src="~/assets/images/EmptyProgram.svg"
          alt=""
          class="empty-state-illustration"
        />
      </template>
      <template
        v-if="
          authStore.viewerData?.role === 'ADMIN' &&
          studentStore.studentResp.data.value?.program_id
        "
        #action
      >
        <UiButton
          variant="outline"
          size="sm"
          @click="
            navigateTo({
              name: 'admin-programs-id',
              params: {
                id: studentStore.studentResp.data.value.program_id,
              },
            })
          "
        >
          <template #icon>
            <IconsEyeIcon />
          </template>
          Manage Program Courses
        </UiButton>
      </template>
    </UiEmptyState>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  studentId: string | number;
  viewer: {
    role: 'ADMIN' | 'REGISTRAR';
    id: string | number;
  };
}>();

const authStore = useAuthStore();
const studentStore = useStudentStore();
const studentId = computed(() => props.studentId);

const courses = computed(
  () => studentStore.studentProgramCoursesResp.data.value ?? [],
);

const loading = computed(() => {
  const loadingStatus = studentStore.studentResp.status.value;
  if (loadingStatus === 'pending' && !courses.value.length) {
    return true;
  }

  return false;
});

watch(
  studentId,
  async (studentId) => {
    if (studentId) {
      if (studentId !== studentStore.selectedStudentId) {
        await studentStore.studentProgramCoursesResp.clear();
        studentStore.selectedStudentId = studentId;
        await studentStore.studentProgramCoursesResp.execute({
          dedupe: 'cancel',
        });
      } else {
        await studentStore.studentProgramCoursesResp.refresh({
          dedupe: 'cancel',
        });
      }
    }
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss" scoped>
.component.entry.student-view-single-program-courses {
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
