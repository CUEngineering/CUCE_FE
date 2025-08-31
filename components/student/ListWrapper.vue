<template>
  <NuxtPage />

  <template v-if="studentStore.selectedStudentId">
    <UiDialog
      v-model="studentStore.isShowingDeleteModal"
      title="Remove Student?"
      message="This student will no longer have access to the CUCE app. To add them back, you will need to send a fresh invite."
      variant="danger"
      :loading="isActionLoading"
      confirm-button-text="Remove"
      @confirm="confirmDeleteStudent"
    />

    <UiDialog
      v-model="studentStore.isShowingSuspendModal"
      title="Suspend Student?"
      message="This Student will not be able to access the app until their account is reactivated."
      variant="warning"
      :loading="isActionLoading"
      confirm-button-text="Suspend"
      @confirm="confirmSuspendStudent"
    />

    <StudentClaimModal
      v-if="selectedStudent && studentStore.isShowingClaimModal"
      v-model="studentStore.isShowingClaimModal"
      mode="claim"
      :student="selectedStudent"
    />
  </template>
</template>

<script setup lang="ts">
const studentStore = useStudentStore();
const isActionLoading = ref(false);

const toast = useToast();
const selectedStudent = computed(
  () => studentStore.studentResp.data.value ?? undefined,
);

const confirmDeleteStudent = async () => {
  if (!studentStore.selectedStudentId) return;

  isActionLoading.value = true;

  try {
    await useBackendRequest<{
      status: 'success';
    }>({
      url: `/students/${studentStore.selectedStudentId}`,
      method: 'delete',
      validateStatus(status) {
        return status < 400;
      },
    });

    // Success case
    toast.success(
      `${selectedStudent.value?.first_name || 'Student'} has been Deleted`,
    );

    await Promise.all([
      studentStore.studentsResp.refresh({
        dedupe: 'cancel',
      }),
      studentStore.studentResp.refresh({
        dedupe: 'cancel',
      }),
    ]);
  } catch (error) {
    console.dir(error);
    // Error case
    toast.error('Failed to delete student');
  } finally {
    isActionLoading.value = false;
    studentStore.isShowingDeleteModal = false;
  }
};

const confirmSuspendStudent = async () => {
  if (!studentStore.selectedStudentId) return;
  isActionLoading.value = true;

  try {
    await useBackendRequest<{
      status: 'success';
    }>({
      url: `/students/${studentStore.selectedStudentId}/reject`,
      method: 'patch',
      validateStatus(status) {
        return status < 400;
      },
    });

    // Simulating API call with timeout
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // Success case
    toast.success(
      `${selectedStudent.value?.first_name ?? 'Student'} has been suspended`,
    );

    await Promise.all([
      studentStore.studentsResp.refresh({
        dedupe: 'cancel',
      }),
      studentStore.studentResp.refresh({
        dedupe: 'cancel',
      }),
    ]);
  } catch (error) {
    console.dir(error);
    // Error case
    toast.error('Failed to suspend student');
  } finally {
    isActionLoading.value = false;
    studentStore.isShowingSuspendModal = false;
  }
};
</script>

<style scoped></style>
