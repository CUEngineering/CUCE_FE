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
      <AdminDash
        clickType="text"
        clickLabel="+ Invite Student"
        statLabel="Students"
        statValue="Total No"
        :number="totalStudents"
        :showDotIcon="true"
        :showQuestionIcon="true"
        :bgImage="AdminBlue"
        color="#2A50AD"
        route="/admin/students"
      />
      <AdminDash
        clickType="text"
        clickLabel="+ Create Couse"
        statLabel="Courses"
        statValue="Total No"
        :number="totalCourses"
        :showDotIcon="true"
        :showQuestionIcon="true"
        :bgImage="AdminOrange"
        color="#E04F16"
        route="/admin/courses"
      />
      <AdminDash
        clickType="text"
        clickLabel="+ Invite Registrar"
        statLabel="Registrars"
        statValue="Total No"
        :number="totalRegistrars"
        :showDotIcon="true"
        :showQuestionIcon="true"
        :bgImage="AdminPink"
        color="#C11574"
        route="/admin/registrars"
      />
      <AdminDash
        clickType="text"
        clickLabel="+ Add Program"
        statLabel="Programmes"
        statValue="Total No"
        :number="totalPrograms"
        :showDotIcon="true"
        :showQuestionIcon="true"
        :bgImage="AdminGreen"
        color="#099250"
        route="/admin/programs"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AdminBlue from "~/assets/images/AdminBlue.svg";
import AdminGreen from "~/assets/images/AdminGreen.svg";
import AdminOrange from "~/assets/images/AdminOrange.svg";
import AdminPink from "~/assets/images/AdminPink.svg";

import AdminDash from "~/components/dashboard/AdminDash.vue";

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
  "dashboard-stats",
  () => null
);

const { call, error, data } = useBackendService(
  "/dashboard/admin/stats",
  "get"
);

const fetchStats = async () => {
  if (!cachedStats.value) {
    try {
      loading.value = true;
      await call();
      loading.value = false;
      cachedStats.value = data.value;
      totalRegistrars.value = data.value.totalRegistrars;
      totalStudents.value = data.value.totalStudents;
      totalPrograms.value = data.value.totalPrograms;
      totalCourses.value = data.value.totalCourses;
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  }

  if (cachedStats.value) {
    totalRegistrars.value = cachedStats.value.totalRegistrars;
    totalStudents.value = cachedStats.value.totalStudents;
    totalPrograms.value = cachedStats.value.totalPrograms;
    totalCourses.value = cachedStats.value.totalCourses;
  }
};

onMounted(() => {
  fetchStats();
});

definePageMeta({
  layout: "dashboard",
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
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
