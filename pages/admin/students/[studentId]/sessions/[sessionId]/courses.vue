<template>
  <StudentViewSingleSessionCourses
    v-if="
      studentId &&
      sessionId &&
      authStore.viewerData &&
      authStore.viewerData.role !== 'STUDENT'
    "
    :student-id="studentId"
    :session-id="sessionId"
    :viewer="authStore.viewerData"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  validate(route) {
    return (
      route.name ===
        'admin-students-studentId-sessions-sessionId-courses' &&
      !isNaN(Number(route.params.studentId)) &&
      !isNaN(Number(route.params.sessionId))
    );
  },
});

const authStore = useAuthStore();
const router = useRouter();
const studentId = computed(() =>
  router.currentRoute.value.name ===
  'admin-students-studentId-sessions-sessionId-courses'
    ? String(router.currentRoute.value.params.studentId)
    : '',
);

const sessionId = computed(() =>
  router.currentRoute.value.name ===
  'admin-students-studentId-sessions-sessionId-courses'
    ? String(router.currentRoute.value.params.sessionId)
    : '',
);
</script>
