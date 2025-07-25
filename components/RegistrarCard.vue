<template>
  <div class="registrar-card" :class="cardClass">
    <div class="registrar-header">
      <div class="registrar-avatar">
        <img :src="registrar.avatar" alt="Registrar avatar" />
      </div>
      <div class="registrar-info">
        <div class="name-status-wrapper">
          <h3 class="registrar-name">{{ registrar.name }}</h3>
          <div class="status-badge" :class="statusClass">
            <span class="status-dot"></span>
            {{ registrar.status }}
          </div>
        </div>
        <p class="registrar-email">{{ registrar.email }}</p>
      </div>
      <div class="registrar-actions">
        <div class="dropdown">
          <button
            @click.stop="toggleDropdown"
            class="action-button"
            aria-haspopup="true"
            :aria-expanded="dropdownOpen"
            :disabled="isDeactivated"
          >
            <DotsVerticalIcon :class="{ 'disabled-icon': isDeactivated }" />
          </button>
          <transition name="dropdown">
            <div v-if="dropdownOpen" class="dropdown-menu" @click.stop>
              <button
                v-if="registrar.status === 'Active'"
                class="dropdown-item"
                @click="suspend"
              >
                <span class="dropdown-icon">
                  <CloseCircleIcon />
                </span>
                Suspend user
              </button>
              <button
                v-if="
                  registrar.status === 'Active' ||
                  registrar.status === 'Suspended'
                "
                class="dropdown-item"
                @click="deactivate"
              >
                <span class="dropdown-icon">
                  <MinusCircleIcon />
                </span>
                Remove user
              </button>
              <button
                v-if="registrar.status === 'Suspended'"
                class="dropdown-item"
                @click="activate"
              >
                <span class="dropdown-icon">
                  <PlusCircleIcon />
                </span>
                Activate user
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <div class="registrar-stats">
      <div class="stat-group">
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-label">Enroll Requests</div>
          <div class="stat-value">{{ registrar.enrollRequests }}</div>
        </div>
      </div>
      <div class="stat-group">
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-label">Approvals</div>
          <div class="stat-value">{{ registrar.approvals }}</div>
        </div>
      </div>
      <div class="stat-group">
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-label">Denials</div>
          <div class="stat-value">{{ registrar.denials }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue";
import DotsVerticalIcon from "~/components/icons/DotsVerticalIcon.vue";
import MinusCircleIcon from "~/components/icons/MinusCircleIcon.vue";
import CloseCircleIcon from "./icons/CloseCircleIcon.vue";
import PlusCircleIcon from "./icons/PlusCircleIcon.vue";

interface Registrar {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: string;
  enrollRequests: number;
  approvals: number;
  denials: number;
}

interface Props {
  registrar: Registrar;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "suspend", registrar: Registrar): void;
  (e: "deactivate", registrar: Registrar): void;
  (e: "delete", registrar: Registrar): void;
  (e: "activate", registrar: Registrar): void;
  (e: "unsuspend", registrar: Registrar): void;
}>();

// Create a unique ID for this card instance
const cardId = Symbol("registrar-card");

// Global registry of open dropdowns
const openDropdownId = inject<Ref<Symbol | null>>("openDropdownId", ref(null));
const dropdownOpen = computed({
  get: () => openDropdownId.value === cardId,
  set: (value) => {
    if (value) {
      openDropdownId.value = cardId;
    } else if (openDropdownId.value === cardId) {
      openDropdownId.value = null;
    }
  },
});

// Toggle dropdown
const toggleDropdown = (event: MouseEvent) => {
  event.stopPropagation(); // Prevent event bubbling
  dropdownOpen.value = !dropdownOpen.value;
};

// Close dropdown when clicking outside
const closeDropdown = (event: MouseEvent) => {
  if (dropdownOpen.value) {
    dropdownOpen.value = false;
  }
};

// Actions
const suspend = async () => {
  emit("suspend", props.registrar);
  dropdownOpen.value = false;
};

const deactivate = () => {
  emit("deactivate", props.registrar);
  dropdownOpen.value = false;
};

const activate = () => {
  emit("activate", props.registrar);
  dropdownOpen.value = false;
};

// Add and remove event listeners
onMounted(() => {
  document.addEventListener("click", closeDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeDropdown);
});

// Status classes
const statusClass = computed(() => {
  switch (props.registrar.status.toLowerCase()) {
    case "active":
      return "status-active";
    case "suspended":
      return "status-suspended";
    case "deactivated":
      return "status-deactivated";
    default:
      return "";
  }
});

// Card class based on status
const cardClass = computed(() => {
  const status = props.registrar.status.toLowerCase();
  return {
    "card-suspended": status === "suspended",
    "card-deactivated": status === "deactivated",
    "card-active": status === "active",
  };
});

// Add computed property to check deactivated status
const isDeactivated = computed(
  () => props.registrar.status.toLowerCase() === "deactivated"
);
</script>

<style lang="scss" scoped>
/* ====================
   Card Base Styles
   ==================== */
.registrar-card {
  background-color: $primary-color-25;
  border-radius: 12px;
  padding: 16px;
  box-shadow: none;
  border: 1px solid $primary-color-200;
  position: relative;
  width: 100%;
  /* max-width: 400px; */
  transition: all 0.2s ease-in-out;

  &.card-active {
    background-color: $primary-color-25;
    border-color: $primary-color-200;
  }

  &.card-deactivated {
    background-color: $white;
    border-color: $gray-200;
    opacity: 0.8;
  }

  &.card-suspended {
    background-color: $white;
    border-color: $gray-200;
  }
}

/* ====================
   Header Section
   ==================== */
.registrar-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 48px;
  gap: 16px;
  width: 100%;
}

.registrar-avatar {
  flex-shrink: 0;

  img {
    width: 48px;
    height: 48px;
    border-radius: 32px;
    object-fit: cover;
    border: 1px solid $primary-color-400;
    transition: all 0.2s ease-in-out;

    .card-suspended & {
      border-color: $warning-500;
    }

    .card-deactivated & {
      border-color: $gray-400;
      opacity: 0.5;
    }
  }
}

.registrar-info {
  flex: 1;
  min-width: 0; /* Prevents flex item from overflowing */
}

.name-status-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.registrar-name {
  font-weight: 600;
  font-size: $text-sm;
  line-height: 1.43;
  margin: 0;
  color: $black;

  .card-deactivated & {
    color: $gray-400;
  }
}

.registrar-email {
  font-size: $text-xs;
  line-height: 1.5;
  color: $gray-500;
  margin: 4px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .card-deactivated & {
    color: $gray-400;
  }
}

/* ====================
   Actions Section
   ==================== */
.registrar-actions {
  flex-shrink: 0;
  position: relative;
}

.action-button {
  background: none;
  border: none;
  color: $gray-500;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  }

  .card-deactivated & {
    color: $gray-400;
  }
}

.disabled-icon {
  color: $gray-400;
  cursor: not-allowed;
}

/* ====================
   Stats Section
   ==================== */
.registrar-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  flex-wrap: wrap;
}

.stat-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 79px;
  max-width: 120px;
}

.stat-divider {
  width: 2px;
  height: 24px;
  background-color: $primary-color-200;
  transition: background-color 0.2s ease;

  .card-suspended &,
  .card-deactivated & {
    background-color: $gray-200;
  }
}

.stat-item {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: $text-xxs;
  line-height: 1.302;
  color: $gray-500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .card-deactivated & {
    color: $gray-400;
  }
}

.stat-value {
  font-weight: 700;
  font-size: $text-sm;
  line-height: 1.43;
  color: $black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .card-deactivated & {
    color: $gray-400;
  }
}

/* ====================
   Status Badge
   ==================== */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px 1px 6px;
  border-radius: 16px;
  font-size: $text-xxs;
  font-weight: 500;
  line-height: 1.8;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-active {
  background-color: $success-50;
  color: $success-400;
  border: 1px solid $success-400;

  .status-dot {
    background-color: $success-400;
  }
}

.status-suspended {
  background-color: $warning-50;
  color: $warning-500;
  border: 1px solid $warning-500;

  .status-dot {
    background-color: $warning-500;
  }
}

.status-deactivated {
  background-color: $gray-50;
  color: $gray-700;
  border: 1px solid $gray-200;

  .status-dot {
    background-color: $gray-400;
  }
}

/* ====================
   Dropdown Styles
   ==================== */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 180px;
  background-color: $white;
  border-radius: 8px;
  box-shadow: 0px 12px 16px -4px rgba(16, 24, 40, 0.08),
    0px 4px 6px -2px rgba(16, 24, 40, 0.03);
  border: 1px solid $gray-200;
  overflow: hidden;
  z-index: 10;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  font-family: $font-family;
  font-size: $text-sm;
  color: $gray-700;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: $gray-50;
  }

  .dropdown-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    width: 16px;
    height: 16px;
    color: $gray-500;
  }
}

/* ====================
   Responsive Styles
   ==================== */
@media (max-width: 400px) {
  .registrar-card {
    padding: 12px;
  }

  .registrar-header {
    margin-bottom: 32px;
    gap: 12px;
  }

  .registrar-stats {
    padding: 0 12px;
    gap: 8px;
  }

  .stat-group {
    min-width: 70px;
  }
}

@media (max-width: 320px) {
  .registrar-avatar img {
    width: 40px;
    height: 40px;
  }

  .registrar-name {
    font-size: $text-sm;
  }

  .registrar-email {
    font-size: $text-xs;
  }

  .stat-value {
    font-size: $text-sm;
  }
}

/* Dropdown transition styles */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
