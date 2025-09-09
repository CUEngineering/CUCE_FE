<template>
  <div class="enrollments-page dashlet-wrapper">
    <div class="page-header dashlet">
      <div class="title-and-filter">
        <h2 class="heading-txt">Dashboard</h2>
      </div>
    </div>
    <Loader v-if="loading" />
    <div
      v-if="!loading"
      style="background-color: white"
      class="registrars-list dashlet-wrapper"
    >
      <DashboardAdminDash
        click-type="button"
        click-label="Students"
        stat-label="."
        stat-value="Total No"
        :number="totalStudents"
        :show-dot-icon="true"
        :show-question-icon="true"
        :bg-image="AdminBlue"
        color="#2A50AD"
        route="/registrar/students"
        @new-data="fetchStats"
      />
      <DashboardAdminDash
        click-type="button"
        click-label="Pending"
        stat-label="."
        stat-value="Total No"
        :number="totalPendingEnrollments"
        :show-dot-icon="true"
        :show-question-icon="true"
        :bg-image="AdminOrange"
        color="#E04F16"
        route="/registrar/enrollments"
        @new-data="fetchStats"
      />
      <DashboardAdminDash
        click-type="button"
        click-label="Approved"
        stat-label=" ."
        stat-value="Total No"
        :number="totalRejectedEnrollments"
        :show-dot-icon="true"
        :show-question-icon="true"
        :bg-image="AdminPink"
        color="#fef6fb"
        route="/registrar/enrollments"
        @new-data="fetchStats"
      />
      <DashboardAdminDash
        click-type="button"
        click-label="Approved"
        stat-label=" ."
        stat-value="Total No"
        :number="totalApprovedEnrollments"
        :show-dot-icon="true"
        :show-question-icon="true"
        :bg-image="AdminGreen"
        color="#099250"
        route="/registrar/enrollments"
        @new-data="fetchStats"
      />
    </div>
    <div v-if="!loading">
      <DashboardAdminEnroll />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdminBlue from '~/assets/images/AdminBlue.svg';
import AdminGreen from '~/assets/images/AdminGreen.svg';
import AdminOrange from '~/assets/images/AdminOrange.svg';
import AdminPink from '~/assets/images/AdminPink.svg';

const loading = ref(false);

const totalStudents = ref(0);
const totalPendingEnrollments = ref(0);
const totalRejectedEnrollments = ref(0);
const totalApprovedEnrollments = ref(0);

interface DashboardStats {
  totalStudents: number;
  totalPendingEnrollments: number;
  totalRejectedEnrollments: number;
  totalApprovedEnrollments: number;
}

const cachedStats = useState<DashboardStats | null>(
  'registrar-dashboard-stats',
  () => null,
);

const { call, error, data } = useBackendService(
  '/dashboard/registrar/stats',
  'get',
);

const fetchStats = async () => {
  await call();
  cachedStats.value = data.value;
  totalStudents.value = data.value.totalStudents;
  totalPendingEnrollments.value = data.value.totalPendingEnrollments;
  totalRejectedEnrollments.value =
    data.value.totalRejectedEnrollments;
  totalApprovedEnrollments.value =
    data.value.totalApprovedEnrollments;
};

onMounted(async () => {
  if (!cachedStats.value) {
    try {
      loading.value = true;
      await fetchStats();
      loading.value = false;
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    }
  }

  if (cachedStats.value) {
    totalStudents.value = cachedStats.value.totalStudents;
    totalPendingEnrollments.value =
      cachedStats.value.totalPendingEnrollments;
    totalRejectedEnrollments.value =
      cachedStats.value.totalRejectedEnrollments;
    totalApprovedEnrollments.value =
      cachedStats.value.totalApprovedEnrollments;
  }
});

definePageMeta({
  layout: 'dashboard',
});
</script>

<style lang="scss" scoped>
.enrollments-page {
  max-width: 100%;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: $spacing-4;

    .title-and-filter {
      display: flex;
      align-items: center;
      gap: $spacing-4;
    }
  }
}
.registrars-list {
  display: grid;
  // grid-template-columns: repeat(4, 1fr);
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  align-items: start;
  overflow-y: auto;
  padding: 12px;
  border-radius: 16px;

  &.is-empty {
    flex: 1;
  }

  > .empty-state {
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
}
</style>
