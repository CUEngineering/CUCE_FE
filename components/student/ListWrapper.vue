<template>
  <NuxtPage />

  <StudentAddModal
    v-model="studentStore.isShowingInviteModal"
    v-model:loading="isActionLoading"
    @invite-success="handleInviteSuccess"
    @invite-failure="handleInviteFailure"
  />

  <UiDialog
    v-model="showInviteSuccessDialog"
    title="Invites Sent!"
    message="Your invitation have been sent to the provided email address. The invited student will receive an email with a link to join the platform."
    variant="success"
    :icon="true"
    cancel-button-text="Awesome 🎉"
    confirm-button-text=""
    :show-cancel-button="true"
    :show-confirm-button="false"
    :show-close-button="true"
    :persistent="false"
    :loading="false"
  />

  <UiDialog
    v-model="showInviteFailureDialog"
    title="Invite failed!"
    message="There was an issue, We’re unable to send your invite to the provided email address. Please try again."
    variant="danger"
    :icon="true"
    cancel-button-text="Try again!"
    confirm-button-text=""
    :show-cancel-button="true"
    :show-confirm-button="false"
    :show-close-button="true"
    :persistent="false"
    :loading="false"
  />

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
      studentStore.sessionStudentsResp.refresh({ dedupe: true }),
      studentStore.allStudentsResp.refresh({ dedupe: true }),
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
      studentStore.sessionStudentsResp.refresh({ dedupe: true }),
      studentStore.allStudentsResp.refresh({ dedupe: true }),
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

const showInviteSuccessDialog = ref(false);
const showInviteFailureDialog = ref(false);
const handleInviteSuccess = async () => {
  await nextTick();
  isActionLoading.value = true;
  await Promise.all([
    studentStore.sessionStudentsResp.refresh({ dedupe: true }),
    studentStore.allStudentsResp.refresh({ dedupe: true }),
  ]);

  studentStore.isShowingInviteModal = false;
  showInviteSuccessDialog.value = true;
};

const handleInviteFailure = async () => {
  await nextTick();
  isActionLoading.value = true;
  await Promise.all([
    studentStore.sessionStudentsResp.refresh({ dedupe: true }),
    studentStore.allStudentsResp.refresh({ dedupe: true }),
  ]);

  studentStore.isShowingInviteModal = false;
  showInviteFailureDialog.value = true;
};
</script>

<style scoped></style>
