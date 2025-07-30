<template>
  <div class="enrollments-page dashlet-wrapper">
    <Loader v-if="loading" />

    <div v-if="!loading">
      <StudentEnroll />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import StudentEnroll from "~/components/dashboard/StudentEnroll.vue";

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
      console.error("Failed to fetch dashboard stats", err);
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
  layout: "student",
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
