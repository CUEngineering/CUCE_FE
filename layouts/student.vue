<template>
  <div class="dashboard-layout">
    <!-- Pass both collapsed and mobile open states to sidebar component -->
    <component :is="getSidebarComponent" :is-collapsed="!sidebarOpen" />

    <div class="content-wrapper" :class="{ 'sidebar-collapsed': !sidebarOpen }">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-left">
          <button
            style="color: white"
            class="menu-toggl header-icon"
            @click="toggleSidebar"
          >
            <MenuIcon />
          </button>
          <button style="background-color: #06061b" class="header-iconm">
            <img :src="logoFull" alt="Charisma Logo" class="logo-icon" />
          </button>
        </div>

        <div class="header-right">
          <div class="notifications">
            <button class="icon-button">
              <BellIcon />
            </button>
          </div>

          <button
            style="color: white"
            class="logout-button"
            @click="handleLogout"
          >
            <LogoutIcon />
          </button>

          <div class="user-profile">
            <img :src="avatar" alt="User avatar" class="avatar" />
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
import logoFull from "@/assets/images/logost.svg";
import { useRouter } from "vue-router";
import AdminSidebar from "~/components/AdminSidebar.vue";
import BellIcon from "~/components/icons/BellIcon.vue";
import LogoutIcon from "~/components/icons/LogoutIcon.vue";
import MenuIcon from "~/components/icons/MenuIcon.vue";
import RegistrarSidebar from "~/components/RegistrarSidebar.vue";
import StudentSidebar from "~/components/StudentSidebar.vue";
import { useToast } from "~/composables/useToast";

// Initialize sidebar as closed on mobile, open on desktop
const sidebarOpen = ref(process.client ? window.innerWidth > 768 : true);
const authStore = useAuthStore();
const { success } = useToast();
const router = useRouter();
const role = useCookie("role").value;
const userCookie = useCookie("user").value;

const defaultAvatar = "https://randomuser.me/api/portraits/women/44.jpg";
const avatar = computed(() => userCookie?.profile_picture ?? defaultAvatar);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function handleLogout() {
  authStore.logout();
  success("Logged out successfully");
  router.push("/login");
}

const getSidebarComponent = computed(() => {
  if (role === "ADMIN") return AdminSidebar;
  if (role === "STUDENT") return StudentSidebar;
  if (role === "REGISTRAR") return RegistrarSidebar;
  return null;
});
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
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;

  &.sidebar-collapsed {
    margin-left: 70px;
  }
}

.dashboard-header {
  height: 64px;
  background-color: #06061b;
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
  border-radius: 0.375rem;
  padding: 0.5rem;
  color: $gray-600;
  transition: background-color 0.2s;
  width: 30px;

  &:hover {
    background-color: $gray-100;
    color: $gray-700;
  }

  @media (min-width: 769px) {
    display: block; /* Show on desktop for toggle functionality */
  }
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
  background-color: transparent;
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
.header-iconm {
  display: none;
}

@media (max-width: 768px) {
  .header-icon {
    display: none;
  }
  .header-iconm {
    display: flex;
  }
  .content-wrapper {
    margin-left: 0 !important; /* Always no margin on mobile */
  }
  .content-wrapper.sidebar-collapsed {
    margin-left: 70px !important;
  }

  .dashboard-header {
    padding: 0 1rem; /* Less padding on mobile */
  }
}
</style>
