<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <!-- Logo -->
    <div class="logo-container">
      <Logo type="full" v-if="!isCollapsed" />
      <Logo type="compact" v-else />
    </div>

    <!-- Navigation Links -->
    <nav class="navigation">
      <NuxtLink
        to="/admin/dashboard"
        class="nav-item"
        :class="{ active: currentPath === '/admin/dashboard' }"
      >
        <span class="icon">
          <IconsHomeIcon />
        </span>
        <span class="label">Dashboard</span>
      </NuxtLink>

      <NuxtLink
        to="/admin/registrars"
        class="nav-item"
        :class="{ active: currentPath === '/admin/registrars' }"
      >
        <span class="icon">
          <IconsUsersIcon />
        </span>
        <span class="label">Registrars</span>
      </NuxtLink>

      <NuxtLink
        to="/admin/enrollments"
        class="nav-item"
        :class="{ active: currentPath === '/admin/enrollments' }"
      >
        <span class="icon">
          <IconsEnrollmentIcon />
        </span>
        <span class="label">Enrollments</span>
      </NuxtLink>

      <NuxtLink
        to="/admin/programs"
        class="nav-item"
        :class="{
          active:
            currentPath === '/admin/programs' ||
            currentPath.startsWith('/admin/programs/'),
        }"
      >
        <span class="icon">
          <IconsBookOpenIcon />
        </span>
        <span class="label">Programs</span>
      </NuxtLink>

      <NuxtLink
        to="/admin/courses"
        class="nav-item"
        :class="{
          active:
            currentPath === '/admin/courses' ||
            currentPath.startsWith('/admin/courses/'),
        }"
      >
        <span class="icon">
          <IconsDocumentIcon />
        </span>
        <span class="label">Courses</span>
      </NuxtLink>

      <NuxtLink
        to="/admin/sessions"
        class="nav-item"
        :class="{
          active:
            currentPath === '/admin/sessions' ||
            currentPath.startsWith('/admin/sessions/'),
        }"
      >
        <span class="icon">
          <IconsCalendarIcon />
        </span>
        <span class="label">Sessions</span>
      </NuxtLink>

      <NuxtLink
        to="/admin/students"
        class="nav-item"
        :class="{
          active:
            currentPath === '/admin/students' ||
            currentPath.startsWith('/admin/students/'),
        }"
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
        <NuxtLink to="/admin/help" class="nav-item">
          <span class="icon">
            <IconsHelpIcon />
          </span>
          <span class="label">Get help</span>
        </NuxtLink>
      </div>

      <div class="settings-section">
        <NuxtLink to="/admin/settings" class="nav-item">
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
// Accept props from parent component
defineProps<{
  isCollapsed?: boolean;
}>();

const route = useRoute();
const currentPath = computed(() => route.path);
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

    .logo-container {
      justify-content: center;
    }

    .nav-item {
      justify-content: center;
      padding: $spacing-3;

      .icon {
        margin-right: 0;
      }
    }
  }

  .logo-container {
    padding: $spacing-4 $spacing-8;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-bottom: 1px solid $gray-200;
    transition: justify-content 0.3s ease;
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
    transition: all 0.2s ease;
    border-radius: 8px;
    font-size: $text-sm;
    font-family: $font-family;
    position: relative;

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
      flex-shrink: 0;
      transition: margin-right 0.3s ease;
    }

    .label {
      white-space: nowrap;
      overflow: hidden;
      transition: opacity 0.3s ease;
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
    transition: transform 0.3s ease;

    &.sidebar-collapsed {
      transform: translateX(0%);
    }
  }
}
</style>
