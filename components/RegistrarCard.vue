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

<style scoped>
.registrar-card {
  background-color: #f4f8ff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: none;
  border: 1px solid #c0dcfd;
  position: relative;
  width: 100%;
  /* max-width: 400px; */
  transition: all 0.2s ease-in-out;
}

/* Card states */
.card-deactivated {
  background-color: #ffffff;
  border-color: #eaecf0;
  opacity: 0.8;
}

.card-suspended {
  background-color: #ffffff;
  border-color: #eaecf0;
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
  border: 1px solid #62a8f8;
  transition: all 0.2s ease-in-out;
}

.card-suspended .registrar-avatar img {
  border-color: #f79009;
}

.card-deactivated .registrar-avatar img {
  border-color: #98a2b3;
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
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.43;
  margin: 0;
  color: #000000;
}

.card-deactivated .registrar-name {
  color: #d0d5dd;
}

.registrar-email {
  font-family: "DM Sans", sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: #667085;
  margin: 4px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-deactivated .registrar-email {
  color: #d0d5dd;
}

.registrar-actions {
  flex-shrink: 0;
}

.action-button {
  background: none;
  border: none;
  color: #344054;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.action-button:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.card-deactivated .action-button {
  color: #d0d5dd;
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
  background-color: #c0dcfd;
  transition: background-color 0.2s ease;
}

.card-suspended .stat-divider {
  background-color: #eaecf0;
}

.card-deactivated .stat-divider {
  background-color: #d0d5dd;
}

.stat-item {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-family: "DM Sans", sans-serif;
  font-size: 8px;
  line-height: 1.302;
  color: #667085;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-deactivated .stat-label {
  color: #d0d5dd;
}

.stat-value {
  font-family: "DM Sans", sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 1.43;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-deactivated .stat-value {
  color: #d0d5dd;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px 1px 6px;
  border-radius: 16px;
  font-family: "DM Sans", sans-serif;
  font-size: 10px;
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
  background-color: #ecfdf3;
  color: #344054;
  border: 1px solid #47cd89;
}

.status-badge.active .status-dot {
  background-color: #47cd89;
}

.status-badge.suspended {
  background-color: #fffaeb;
  color: #344054;
  border: 1px solid #f79009;
}

.status-badge.suspended .status-dot {
  background-color: #f79009;
}

.status-badge.deactivated {
  background-color: #f9fafb;
  color: #344054;
  border: 1px solid #eaecf0;
}

.status-badge.deactivated .status-dot {
  background-color: #667085;
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
    font-size: 13px;
  }

  .registrar-email {
    font-size: 11px;
  }

  .stat-value {
    font-size: 13px;
  }
}
</style>
