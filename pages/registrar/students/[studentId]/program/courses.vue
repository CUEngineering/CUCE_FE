<template>
  <StudentViewSingleProgramCourses
    v-if="
      studentId &&
      authStore.viewerData &&
      authStore.viewerData.role !== 'STUDENT'
    "
    :student-id="studentId"
    :viewer="authStore.viewerData"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  validate(route) {
    return (
      route.name === 'registrar-students-studentId-program-courses' &&
      !isNaN(Number(route.params.studentId))
    );
  },
});

const authStore = useAuthStore();
const router = useRouter();
const studentId = computed(() =>
  router.currentRoute.value.name ===
  'registrar-students-studentId-program-courses'
    ? String(router.currentRoute.value.params.studentId)
    : '',
);
</script>
