<template>
  <div class="registrar-card" :class="cardClass">
    <div class="registrar-header">
      <div class="registrar-info">
        <div class="name-status-wrapper">
          <h3 class="registrar-name">{{ session.sessionName }}</h3>
          <div
            class="status-badge"
            :class="getStatusClass(session.sessionStatus)"
          >
            <span class="status-dot"></span>
            {{ getStatusText(session.sessionStatus) }}
          </div>
        </div>
      </div>
      <div v-if="session.sessionStatus !== 'CLOSED'" class="registrar-actions">
        <div class="dropdown">
          <button
            @click.stop="toggleDropdown"
            class="action-button"
            aria-haspopup="true"
            :aria-expanded="dropdownOpen"
          >
            <DotsVerticalIcon />
          </button>
          <transition name="dropdown">
            <div v-if="dropdownOpen" class="dropdown-menu" @click.stop>
              <button
                class="dropdown-item"
                @click="$emit('edit-session', session)"
              >
                <span class="dropdown-icon">
                  <EditIcon />
                </span>
                Edit Session
              </button>

              <button
                class="dropdown-item"
                @click="$emit('adjust-enrollment', session)"
              >
                <span class="dropdown-icon">
                  <AlarmIcon />
                </span>
                Adjust Enrollment
              </button>

              <button
                v-if="session.sessionStatus !== 'ACTIVE'"
                class="dropdown-item"
                @click="$emit('start-session', session)"
              >
                <span class="dropdown-icon">
                  <PlayIcon />
                </span>
                Start Session
              </button>

              <button
                v-if="session.sessionStatus !== 'ACTIVE'"
                style="color: red"
                class="dropdown-item"
                @click="$emit('delete-session', session)"
              >
                <span class="dropdown-icon">
                  <DeleteIcon />
                </span>
                Delete Session
              </button>

              <button
                v-if="session.sessionStatus === 'ACTIVE'"
                class="dropdown-item"
                @click="$emit('close-session', session)"
              >
                <span class="dropdown-icon">
                  <CloseCircleIcon />
                </span>
                Close Session
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <div class="registrar-stats" :class="boxClass">
      <div class="stat-group">
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-label">Enrollment Deadline</div>
          <div class="stat-value">
            {{ formatDate(session.enrollmentDeadline) }}
          </div>
        </div>
      </div>
      <div class="stat-group">
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-label">Courses</div>
          <div class="stat-value">{{ session.numberOfOpenCourses }}</div>
        </div>
      </div>
      <div class="stat-group">
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-label">Students</div>
          <div class="stat-value">{{ session.numberOfStudents }}</div>
        </div>
      </div>
    </div>
    <div
      style="
        width: max-content;
        padding: 10px;
        margin-top: 10px;
        display: flex;
        flex-direction: column;
      "
      class="profile-count pill p-grey"
    >
      <p style="font-size: small">Duration</p>
      <div>
        <span><SessionIcon /></span>
        {{ formatDate(session.startDate) }} -
        {{ formatDate(session.endDate) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue";
import DotsVerticalIcon from "~/components/icons/DotsVerticalIcon.vue";
import { formatDate, getStatusClass, getStatusText } from "~/helper/formatData";
import AlarmIcon from "../icons/AlarmIcon.vue";
import CloseCircleIcon from "../icons/CloseCircleIcon.vue";
import DeleteIcon from "../icons/DeleteIcon.vue";
import EditIcon from "../icons/EditIcon.vue";
import PlayIcon from "../icons/PlayIcon.vue";
import SessionIcon from "../icons/sessionIcon.vue";

interface Session {
  sessionId: number;
  sessionName: string;
  startDate: string;
  endDate: string;
  enrollmentDeadline: string;
  sessionStatus: string;
  numberOfOpenCourses: number;
  numberOfStudents: number;
}

interface Props {
  session: Session;
}

const props = defineProps<Props>();
defineEmits([
  "edit-session",
  "adjust-enrollment",
  "start-session",
  "delete-session",
  "close-session",
]);

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

// Add and remove event listeners
onMounted(() => {
  document.addEventListener("click", closeDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeDropdown);
});

// Card class based on status
const cardClass = computed(() => {
  const status = props.session.sessionStatus.toLowerCase();
  return {
    "card-suspended": status === "suspended",
    "card-deactivated": status === "closed",
    "card-active": status === "active",
  };
});
const boxClass = computed(() => {
  const status = props.session.sessionStatus.toLowerCase();
  return {
    "blue-box": status === "pending",
    "grey-box": status === "closed",
    "green-box": status === "active",
  };
});
</script>

<style lang="scss" scoped>
/* ====================
   Card Base Styles
   ==================== */
.registrar-card {
  background-color: $white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: none;
  border: 1px solid rgb(210, 210, 210);
  position: relative;
  width: 100%;
  /* max-width: 400px; */
  transition: all 0.2s ease-in-out;

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
  margin-bottom: 10px;
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
  padding: 10px 16px;
  gap: 10px;
  flex-wrap: wrap;
}
.green-box {
  background-color: $success-50;
  border: 1px solid $success-400;
  border-radius: 10px;
}
.blue-box {
  background-color: $primary-color-25;
  border: 1px solid $primary-color-400;
  border-radius: 10px;
}
.grey-box {
  background-color: $gray-50;
  border: 1px solid $gray-300;
  border-radius: 10px;
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

  .green-box & {
    background-color: $success-400;
  }
  .blue-box & {
    background-color: $primary-color-400;
  }

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
  color: $gray-700;
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
