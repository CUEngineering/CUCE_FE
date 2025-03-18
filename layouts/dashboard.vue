<template>
  <div class="dashboard-layout">
    <Sidebar />

    <div class="content-wrapper">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-left">
          <button class="menu-toggle" @click="toggleSidebar">
            <MenuIcon />
          </button>
        </div>

        <div class="header-right">
          <div class="notifications">
            <button class="icon-button">
              <BellIcon />
            </button>
          </div>

          <button class="logout-button" @click="handleLogout">
            <LogoutIcon class="logout-icon" />
            <span>Log out</span>
          </button>

          <div class="user-profile">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="User avatar"
              class="avatar"
            />
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="dashboard-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import MenuIcon from "~/components/icons/MenuIcon.vue";
import BellIcon from "~/components/icons/BellIcon.vue";
import LogoutIcon from "~/components/icons/LogoutIcon.vue";
import { useAuth } from "~/composables/useAuth";

const sidebarOpen = ref(true);
const { signOut } = useAuth();

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
  // You would emit an event or use a store to communicate with the Sidebar component
}

function handleLogout() {
  signOut();
}
</script>

<style lang="scss" scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: $gray-50;
}

.content-wrapper {
  flex: 1;
  margin-left: 250px; /* Same as sidebar width */
  transition: margin 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed + .content-wrapper {
  margin-left: 70px;
}

.dashboard-header {
  height: 64px;
  background-color: white;
  border-bottom: 1px solid $gray-200;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 5;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.header-right {
  gap: 1rem;
}

.menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  display: none;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.375rem;
  padding: 0.5rem;
  color: $gray-600;
  transition: background-color 0.2s;
}

.icon-button:hover {
  background-color: $gray-100;
  color: $gray-700;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: $gray-100;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  color: $gray-700;
  font-weight: 500;
  font-size: $text-sm;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: $gray-200;
    color: $gray-900;
  }

  .logout-icon {
    width: 16px;
    height: 16px;
  }
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.dashboard-content {
  padding: 10px;
  flex: 1;
  background: $white;
}

@media (max-width: 768px) {
  .content-wrapper {
    margin-left: 0;
  }

  .menu-toggle {
    display: block;
  }
}
</style>
