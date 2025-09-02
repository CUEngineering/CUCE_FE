<template>
  <div
    class="component entry student-view-single-courses-empty-state"
  >
    <UiEmptyState
      class="empty"
      title="No Selected Session yet"
      description="Selected sessions / Program courses will be displayed here. Select a session or click on view program courses to view student program courses"
    >
      <template #icon>
        <img
          src="~/assets/images/EmptyProgram.svg"
          alt=""
          class="empty-state-illustration"
        />
      </template>
      <template #action>
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
      </template>
    </UiEmptyState>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  student_id: string | number;
  viewer: {
    role: 'ADMIN' | 'REGISTRAR';
    id: string | number;
  };
}>();

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
</script>

<style lang="scss" scoped>
.component.entry.student-view-single-courses-empty-state {
  display: flex;
  width: 100%;
  min-height: 100%;
  justify-content: center;
  align-items: center;
}
</style>
