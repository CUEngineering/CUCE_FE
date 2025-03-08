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
        <button class="action-button">
          <DotsVerticalIcon />
        </button>
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

<script setup>
import { computed } from "vue";
import DotsVerticalIcon from "~/components/icons/DotsVerticalIcon.vue";

const props = defineProps({
  registrar: {
    type: Object,
    required: true,
    validator: (value) => {
      return [
        "name",
        "email",
        "avatar",
        "status",
        "enrollRequests",
        "approvals",
        "denials",
      ].every((key) => key in value);
    },
  },
});

const statusClass = computed(() => {
  return props.registrar.status.toLowerCase();
});

const cardClass = computed(() => {
  return `card-${props.registrar.status.toLowerCase()}`;
});
</script>

<style lang="scss" scoped>
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
}

/* Card states */
.card-deactivated {
  background-color: $white;
  border-color: $gray-200;
  opacity: 0.8;
}

.card-suspended {
  background-color: $white;
  border-color: $gray-200;
}

.registrar-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 48px;
  gap: 16px;
  width: 100%;
}

.registrar-avatar {
  flex-shrink: 0;
}

.registrar-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 32px;
  object-fit: cover;
  border: 1px solid $primary-color-400;
  transition: all 0.2s ease-in-out;
}

.card-suspended .registrar-avatar img {
  border-color: $warning-500;
}

.card-deactivated .registrar-avatar img {
  border-color: $gray-400;
  opacity: 0.5;
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
}

.card-deactivated .registrar-name {
  color: $gray-400;
}

.registrar-email {
  font-size: $text-xs;
  line-height: 1.5;
  color: $gray-500;
  margin: 4px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-deactivated .registrar-email {
  color: $gray-400;
}

.registrar-actions {
  flex-shrink: 0;
}

.action-button {
  background: none;
  border: none;
  color: $gray-500;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.action-button:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.card-deactivated .action-button {
  color: $gray-400;
}

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
}

.card-suspended .stat-divider {
  background-color: $gray-200;
}

.card-deactivated .stat-divider {
  background-color: $gray-200;
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
}

.card-deactivated .stat-label {
  color: $gray-400;
}

.stat-value {
  font-weight: 700;
  font-size: $text-sm;
  line-height: 1.43;
  color: $black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-deactivated .stat-value {
  color: $gray-400;
}

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

.status-badge.active {
  background-color: $success-50;
  color: $gray-700;
  border: 1px solid $success-400;
}

.status-badge.active .status-dot {
  background-color: $success-400;
}

.status-badge.suspended {
  background-color: $warning-50;
  color: $warning-500;
  border: 1px solid $warning-500;
}

.status-badge.suspended .status-dot {
  background-color: $warning-500;
}

.status-badge.deactivated {
  background-color: $gray-50;
  color: $gray-700;
  border: 1px solid $gray-200;
}

.status-badge.deactivated .status-dot {
  background-color: $gray-400;
}

/* Responsive styles */
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
</style>
