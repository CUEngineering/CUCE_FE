<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <!-- Logo -->
    <div class="logo-container">
      <StudentLogo type="full" v-if="!isCollapsed" />
      <Logo type="compact" v-else />
    </div>

    <!-- Navigation Links -->
    <nav class="navigation">
      <NuxtLink
        to="/student/dashboard"
        class="nav-item"
        :class="{ active: currentPath === '/student/dashboard' }"
      >
        <span class="icon">
          <StudentDash />
        </span>
        <span class="label">Dashboard</span>
      </NuxtLink>

      <NuxtLink
        to="/student/courses"
        class="nav-item"
        :class="{ active: currentPath === '/student/courses' }"
      >
        <span class="icon">
          <StudentCourse />
        </span>
        <span class="label">Courses</span>
      </NuxtLink>

      <NuxtLink
        to="/student/requests"
        class="nav-item"
        :class="{ active: currentPath === '/student/requests' }"
      >
        <span class="icon">
          <StudentRequest />
        </span>
        <span class="label">Requests</span>
      </NuxtLink>

      <NuxtLink
        to="/student/hub"
        class="nav-item"
        :class="{ active: currentPath === '/student/hub' }"
      >
        <span class="icon">
          <StudentHub />
        </span>
        <span class="label">My Hub</span>
      </NuxtLink>
    </nav>

    <!-- Bottom Section -->
    <div class="sidebar-bottom">
      <div class="help-section">
        <NuxtLink to="/student/help" class="nav-item">
          <span class="icon">
            <IconsHelpIcon />
          </span>
          <span class="label">Get help</span>
        </NuxtLink>
      </div>

      <div class="settings-section">
        <NuxtLink to="/student/settings" class="nav-item">
          <span class="icon">
            <IconsSettingsIcon />
          </span>
          <span class="label">Settings</span>
        </NuxtLink>
      </div>
    </div>
  </div>

  <div class="mobile-bottom-nav" v-if="isMobile">
    <NuxtLink
      to="/student/dashboard"
      class="bottom-nav-item"
      :class="{ active: currentPath === '/student/dashboard' }"
    >
      <StudentDash />
    </NuxtLink>
    <NuxtLink
      to="/student/courses"
      class="bottom-nav-item"
      :class="{ active: currentPath === '/student/courses' }"
    >
      <StudentCourse />
    </NuxtLink>
    <NuxtLink
      to="/student/requests"
      class="bottom-nav-item"
      :class="{ active: currentPath === '/student/requests' }"
    >
      <StudentRequest />
    </NuxtLink>
    <NuxtLink
      to="/student/hub"
      class="bottom-nav-item"
      :class="{ active: currentPath === '/student/hub' }"
    >
      <StudentHub />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import StudentCourse from "./icons/StudentCourse.vue";
import StudentDash from "./icons/StudentDash.vue";
import StudentHub from "./icons/StudentHub.vue";
import StudentRequest from "./icons/StudentRequest.vue";
import StudentLogo from "./StudentLogo.vue";

// Accept props from parent component
defineProps<{
  isCollapsed?: boolean;
}>();

const route = useRoute();
const currentPath = computed(() => route.path);

const isMobile = computed(() => window.innerWidth <= 768);
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
    background-color: #06061b;
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
@media (max-width: $breakpoint-md) {
  .sidebar {
    display: none;
  }
}
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: $white;
  border-top: 1px solid $gray-200;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 20;

  .bottom-nav-item {
    flex: 1;
    text-align: center;
    padding: 10px;
    color: $gray-600;

    &.active {
      color: $primary-color-700;
    }

    svg {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
