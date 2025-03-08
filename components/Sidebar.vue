<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <!-- Logo -->
    <div class="logo-container">
      <Logo type="full" />
    </div>

    <!-- Navigation Links -->
    <nav class="navigation">
      <NuxtLink
        to="/dashboard"
        class="nav-item"
        :class="{ active: currentPath === '/dashboard' }"
      >
        <span class="icon">
          <IconsHomeIcon />
        </span>
        <span class="label">Dashboard</span>
      </NuxtLink>

      <NuxtLink
        to="/registrars"
        class="nav-item"
        :class="{ active: currentPath === '/registrars' }"
      >
        <span class="icon">
          <IconsUsersIcon />
        </span>
        <span class="label">Registrars</span>
      </NuxtLink>

      <NuxtLink
        to="/enrollments"
        class="nav-item"
        :class="{ active: currentPath === '/enrollments' }"
      >
        <span class="icon">
          <IconsEnrollmentIcon />
        </span>
        <span class="label">Enrollments</span>
      </NuxtLink>

      <NuxtLink
        to="/programmes"
        class="nav-item"
        :class="{ active: currentPath === '/programmes' }"
      >
        <span class="icon">
          <IconsBookOpenIcon />
        </span>
        <span class="label">Programmes</span>
      </NuxtLink>

      <NuxtLink
        to="/courses"
        class="nav-item"
        :class="{ active: currentPath === '/courses' }"
      >
        <span class="icon">
          <IconsDocumentIcon />
        </span>
        <span class="label">Courses</span>
      </NuxtLink>

      <NuxtLink
        to="/sessions"
        class="nav-item"
        :class="{ active: currentPath === '/sessions' }"
      >
        <span class="icon">
          <IconsCalendarIcon />
        </span>
        <span class="label">Sessions</span>
      </NuxtLink>

      <NuxtLink
        to="/students"
        class="nav-item"
        :class="{ active: currentPath === '/students' }"
      >
        <span class="icon">
          <IconsAcademicCapIcon />
        </span>
        <span class="label">Students</span>
      </NuxtLink>
    </nav>

    <!-- Bottom Section -->
    <div class="sidebar-bottom">
      <div class="help-section">
        <NuxtLink to="/help" class="nav-item">
          <span class="icon">
            <IconsHelpIcon />
          </span>
          <span class="label">Get help</span>
        </NuxtLink>
      </div>

      <div class="settings-section">
        <NuxtLink to="/settings" class="nav-item">
          <span class="icon">
            <IconsSettingsIcon />
          </span>
          <span class="label">Settings</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const currentPath = computed(() => route.path);
const isCollapsed = ref(false);

// Toggle sidebar function (can be used for mobile responsiveness)
function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: $white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid $gray-200;
  transition: width 0.3s ease;
  overflow-y: auto;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;

  &.sidebar-collapsed {
    width: 70px;

    .label {
      display: none;
    }
  }

  .logo-container {
    padding: $spacing-4 $spacing-8;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-bottom: 1px solid $gray-200;
  }

  .navigation {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: $spacing-4 $spacing-3;
    gap: $spacing-2;
  }

  .nav-item {
    display: flex;
    align-items: center;
    padding: $spacing-3 $spacing-6;
    color: $gray-600;
    text-decoration: none;
    transition: background-color 0.2s, color 0.2s;
    border-radius: 8px;
    font-size: $text-sm;
    font-family: $font-family;

    &:hover {
      background-color: $gray-100;
      color: $gray-900;
    }

    &.active {
      background-color: $primary-color-50;
      color: $primary-color-700;
      font-weight: 600;
    }

    .icon {
      width: 24px;
      height: 24px;
      margin-right: $spacing-3;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .sidebar-bottom {
    border-top: 1px solid $gray-200;
    display: flex;
    flex-direction: column;
    padding: $spacing-4 $spacing-3;
    gap: $spacing-2;
  }

  @media (max-width: $breakpoint-md) {
    transform: translateX(-100%);

    &.active {
      transform: translateX(0);
    }
  }
}
</style>
