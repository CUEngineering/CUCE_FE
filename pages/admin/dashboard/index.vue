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
        click-type="text"
        click-label="+ Invite Student"
        stat-label="Students"
        stat-value="Total No"
        :number="totalStudents"
        :show-dot-icon="true"
        :show-question-icon="true"
        :bg-image="AdminBlue"
        color="#2A50AD"
        route="/admin/students"
        @new-data="fetchStats"
      />
      <DashboardAdminDash
        click-type="text"
        click-label="+ Create Course"
        stat-label="Courses"
        stat-value="Total No"
        :number="totalCourses"
        :show-dot-icon="true"
        :show-question-icon="true"
        :bg-image="AdminOrange"
        color="#E04F16"
        route="/admin/courses"
        @new-data="fetchStats"
      />
      <DashboardAdminDash
        click-type="text"
        click-label="+ Invite Registrar"
        stat-label="Registrars"
        stat-value="Total No"
        :number="totalRegistrars"
        :show-dot-icon="true"
        :show-question-icon="true"
        :bg-image="AdminPink"
        color="#C11574"
        route="/admin/registrars"
        @new-data="fetchStats"
      />
      <DashboardAdminDash
        click-type="text"
        click-label="+ Add Program"
        stat-label="Programmes"
        stat-value="Total No"
        :number="totalPrograms"
        :show-dot-icon="true"
        :show-question-icon="true"
        :bg-image="AdminGreen"
        color="#099250"
        route="/admin/programs"
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

const totalRegistrars = ref(0);
const totalStudents = ref(0);
const totalPrograms = ref(0);
const totalCourses = ref(0);
interface DashboardStats {
  totalRegistrars: number;
  totalStudents: number;
  totalPrograms: number;
  totalCourses: number;
}

const cachedStats = useState<DashboardStats | null>(
  'admin-dashboard-stats',
  () => null,
);

const { call, error, data } = useBackendService(
  '/dashboard/admin/stats',
  'get',
);

const fetchStats = async () => {
  await call();
  cachedStats.value = data.value;
  totalRegistrars.value = data.value.totalRegistrars;
  totalStudents.value = data.value.totalStudents;
  totalPrograms.value = data.value.totalPrograms;
  totalCourses.value = data.value.totalCourses;
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
    totalRegistrars.value = cachedStats.value.totalRegistrars;
    totalStudents.value = cachedStats.value.totalStudents;
    totalPrograms.value = cachedStats.value.totalPrograms;
    totalCourses.value = cachedStats.value.totalCourses;
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
  display: flex;
  flex-direction: row;
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

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
  }
}
</style>
