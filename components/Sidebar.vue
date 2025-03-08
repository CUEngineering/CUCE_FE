<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <!-- Logo -->
    <div class="logo-container">
      <Logo />
    </div>

    <!-- Navigation Links -->
    <nav class="navigation">
      <NuxtLink
        to="/dashboard"
        class="nav-item"
        :class="{ active: currentPath === '/dashboard' }"
      >
        <span class="icon">
          <HomeIcon />
        </span>
        <span class="label">Dashboard</span>
      </NuxtLink>

      <NuxtLink
        to="/registrars"
        class="nav-item"
        :class="{ active: currentPath === '/registrars' }"
      >
        <span class="icon">
          <UsersIcon />
        </span>
        <span class="label">Registrars</span>
      </NuxtLink>

      <NuxtLink
        to="/enrollments"
        class="nav-item"
        :class="{ active: currentPath === '/enrollments' }"
      >
        <span class="icon">
          <EnrollmentIcon />
        </span>
        <span class="label">Enrollments</span>
      </NuxtLink>

      <NuxtLink
        to="/programmes"
        class="nav-item"
        :class="{ active: currentPath === '/programmes' }"
      >
        <span class="icon">
          <BookOpenIcon />
        </span>
        <span class="label">Programmes</span>
      </NuxtLink>

      <NuxtLink
        to="/courses"
        class="nav-item"
        :class="{ active: currentPath === '/courses' }"
      >
        <span class="icon">
          <DocumentIcon />
        </span>
        <span class="label">Courses</span>
      </NuxtLink>

      <NuxtLink
        to="/sessions"
        class="nav-item"
        :class="{ active: currentPath === '/sessions' }"
      >
        <span class="icon">
          <CalendarIcon />
        </span>
        <span class="label">Sessions</span>
      </NuxtLink>

      <NuxtLink
        to="/students"
        class="nav-item"
        :class="{ active: currentPath === '/students' }"
      >
        <span class="icon">
          <AcademicCapIcon />
        </span>
        <span class="label">Students</span>
      </NuxtLink>
    </nav>

    <!-- Bottom Section -->
    <div class="sidebar-bottom">
      <div class="help-section">
        <NuxtLink to="/help" class="nav-item">
          <span class="icon">
            <HelpIcon />
          </span>
          <span class="label">Get help</span>
        </NuxtLink>
      </div>

      <div class="settings-section">
        <NuxtLink to="/settings" class="nav-item">
          <span class="icon">
            <SettingsIcon />
          </span>
          <span class="label">Settings</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import HomeIcon from "~/components/icons/HomeIcon.vue";
import UsersIcon from "~/components/icons/UsersIcon.vue";
import EnrollmentIcon from "~/components/icons/EnrollmentIcon.vue";
import BookOpenIcon from "~/components/icons/BookOpenIcon.vue";
import DocumentIcon from "~/components/icons/DocumentIcon.vue";
import CalendarIcon from "~/components/icons/CalendarIcon.vue";
import AcademicCapIcon from "~/components/icons/AcademicCapIcon.vue";
import HelpIcon from "~/components/icons/HelpIcon.vue";
import SettingsIcon from "~/components/icons/SettingsIcon.vue";

const route = useRoute();
const currentPath = computed(() => route.path);
const isCollapsed = ref(false);

// Toggle sidebar function (can be used for mobile responsiveness)
function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
  transition: width 0.3s ease;
  overflow-y: auto;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;
}

.sidebar-collapsed {
  width: 70px;
}

.logo-container {
  padding: 1.5rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.navigation {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #4b5563;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
  margin-bottom: 0.5rem;
  border-radius: 0.375rem;
  margin-left: 0.75rem;
  margin-right: 0.75rem;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.nav-item.active {
  background-color: #eef2ff;
  color: #4f46e5;
  font-weight: 500;
}

.icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sidebar-collapsed .label {
  display: none;
}

.sidebar-bottom {
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.active {
    transform: translateX(0);
  }
}
</style>
