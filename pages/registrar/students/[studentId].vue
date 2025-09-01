<template>
  <StudentViewSingle
    v-if="
      studentId &&
      authStore.viewerData &&
      authStore.viewerData.role !== 'STUDENT'
    "
    :student_id="studentId"
    :viewer="authStore.viewerData"
  />
</template>

<script setup lang="ts">
import { get } from 'lodash-es';

definePageMeta({
  layout: 'dashboard',
  validate(route) {
    const studentId = get(route.params, 'studentId');
    return (
      route.name.startsWith('registrar-students-studentId') &&
      !isNaN(Number(studentId))
    );
  },
});

const router = useRouter();
const authStore = useAuthStore();
const studentId = computed(() => {
  if (
    router.currentRoute.value.name.startsWith(
      'registrar-students-studentId',
    )
  ) {
    const id = get(router.currentRoute.value.params, 'studentId');
    return id ? String(id) : undefined;
  }

  return undefined;
});
</script>
