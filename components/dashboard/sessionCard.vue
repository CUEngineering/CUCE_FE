<template>
  <div v-if="role === 'STUDENT'">
    <div
      style="cursor: pointer; margin-bottom: 20px"
      class="registrar-card image"
    >
      <div class="dialog-header">
        <div class="dialog-icon">
          <img
            class="roundedImage"
            :src="authStore.user?.profile_picture"
            :alt="'icon'"
          />
        </div>
        <div class="student-details">
          <div style="color: white; font-weight: bold" class="student-name">
            {{ authStore.user?.first_name }} {{ " " }}
            {{ authStore.user?.last_name }}
          </div>
        </div>
        <div style="display: flex; align-items: center">
          <div style="margin-right: 5px; color: white">
            {{ authStore.user?.reg_number }}{{ " " }}<Copy />
          </div>
          <DotWhite />
          <div style="margin-left: 5px; color: white">
            {{ authStore.user?.program.total_credits }}{{ " " }}Units
          </div>
        </div>
        <div class="student-details">
          <div style="color: white; font-weight: bold" class="student-name">
            {{ authStore.user?.program.program_name }}{{ " " }}<Copy />
          </div>
        </div>

        <div
          style="display: flex; align-items: center; color: white; margin: 20px"
        >
          <div style="margin-right: 5px">Edit Profile</div>
          <EditIcon />
        </div>
      </div>
    </div>
  </div>
  <div style="cursor: pointer" class="registrar-card">
    <div class="registrar-header">
      <div class="registrar-info">
        <div class="name-status-wrapper">
          <h3 class="registrar-name">Current Session <Question /></h3>
        </div>
      </div>
    </div>
    <!-- Circular Progress Bar -->
    <div
      v-if="role !== 'STUDENT'"
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 20px 0;
      "
    >
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="47"
          stroke="#e0e0e0"
          stroke-width="3"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="47"
          :stroke="progressColor"
          stroke-width="3"
          fill="none"
          :stroke-dasharray="295"
          :stroke-dashoffset="295 - (progress * 295) / 100"
          stroke-linecap="round"
          transform="rotate(-90 50 50)"
        />
        <text
          x="50"
          y="55"
          text-anchor="middle"
          font-size="18"
          fill="#2a50ad"
          font-weight="bold"
        >
          {{ new Date(session.endDate).getDate() }}
          <tspan font-size="10">th</tspan>
        </text>
      </svg>

      <div
        style="
          margin-top: 10px;
          font-size: 14px;
          font-weight: 500;
          /* color: #2a50ad; */
        "
      >
        {{
          new Date(session.endDate).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        }}
      </div>
    </div>
    <div v-if="role === 'ADMIN'" class="registrar-stats grey-box">
      <div
        style="display: flex; width: -webkit-fill-available; text-align: center"
      >
        <div class="stat-item">
          <div class="stat-label">Courses</div>
          <div class="stat-value">
            {{ session.numberOfOpenCourses }}
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Programmes</div>
          <div class="stat-value">
            {{ session.numberOfOpenCourses }}
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Students</div>
          <div class="stat-value">
            {{ session.numberOfStudents }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="role === 'REGISTRAR'" class="registrar-stats grey-box">
      <div
        style="display: flex; width: -webkit-fill-available; text-align: center"
      >
        <div class="stat-item">
          <div class="stat-label">Assigned Requests</div>
          <div class="stat-value">
            {{ enrollments.length || 0 }}
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Assigned Students</div>
          <div class="stat-value">
            {{ session.numberOfStudents }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="role === 'ADMIN'">
      <div class="registrar-stats grey-box">
        <div class="stat-group">
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-label">Session Duration</div>
            <div class="stat-value">
              <div>
                <span><SessionIcon /></span>
                {{ formatDate(session.startDate) }} -
                {{ formatDate(session.endDate) }}
              </div>
            </div>
            <hr style="width: 20vw" />
            <div
              style="
                width: 20vw;
                display: flex;
                align-items: center;
                justify-content: space-between;
              "
            >
              <div>
                <span><ClockIcon /></span>
                {{ daysLeft(session.endDate) }} left
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="registrar-stats grey-box">
        <div class="stat-group">
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-label">Enrollment Deadline</div>
            <div class="stat-value">
              <div>
                <span><SessionIcon /></span>
                {{ formatDate(session.enrollmentDeadline) }}
              </div>
            </div>
            <hr style="width: 20vw" />
            <div
              style="
                width: 20vw;
                display: flex;
                align-items: center;
                justify-content: space-between;
              "
            >
              <div>
                <span><ClockIcon /></span>
                {{ daysLeft(session.enrollmentDeadline) }} left
              </div>
              <p
                v-if="role === 'ADMIN'"
                @click="$emit('edit-session', session)"
                style="color: #2a50ad; font-size: smaller"
              >
                Extend Deadline
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="role !== 'ADMIN'">
      <div
        style="display: flex; flex-direction: column; background-color: #dbebfe"
        class="registrar-stats plain-box"
      >
        <div class="stat-divide"></div>
        <div class="stat-label">Session Duration</div>
        <div>
          <span><SessionIcon /></span>
          {{ formatDate(session.startDate) }} -
          {{ formatDate(session.endDate) }}
        </div>
        <hr style="width: 15vw; background-color: #2a50ad" />
        <div>
          <span><ClockIcon /></span>{{ " " }} Session starts in
          {{ daysLeft(session.startDate) }}
        </div>
      </div>
      <div
        style="display: flex; flex-direction: column"
        class="registrar-stats yellow-box"
      >
        <div class="stat-divide" style="background-color: #a05300"></div>
        <div class="stat-label">Enrollment Dealine</div>
        <div>
          <span><SessionIcon /></span>
          {{ formatDate(session.enrollmentDeadline) }}
        </div>
        <hr style="width: 15vw; background-color: #2a50ad" />
        <div>
          <span><ClockIcon /></span>{{ " " }}
          {{ daysLeft(session.startDate) }} left to enroll
        </div>
      </div>
    </div>
  </div>
  <p
    v-if="role === 'ADMIN'"
    @click="$emit('close-session', session)"
    style="text-align: center; color: red; padding: 20px; cursor: pointer"
  >
    Close Session
  </p>
</template>

<script setup lang="ts">
import { formatDate } from "~/helper/formatData";
import ClockIcon from "../icons/ClockIcon.vue";
import Copy from "../icons/Copy.vue";
import DotWhite from "../icons/DotWhite.vue";
import EditIcon from "../icons/EditIcon.vue";
import Question from "../icons/Question.vue";
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
const auth = useAuthStore();
const role = auth.role as "ADMIN" | "REGISTRAR" | "STUDENT";
const props = defineProps<Props>();
defineEmits(["edit-session", "close-session"]);
const daysLeft = (date: string) => {
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? `${diffDays} day(s)` : "Expired";
};

const today = new Date() as any;
const end = new Date(props.session.endDate) as any;
const start = new Date(props.session.startDate) as any;
const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

const daysPassed = Math.min(
  totalDays,
  Math.max(0, Math.ceil((today - start) / (1000 * 60 * 60 * 24)))
);

const progress = computed(() => Math.round((daysPassed / totalDays) * 100));

const progressColor = "#2a50ad";
const { call, data } = useBackendService("/enrollments", "get");
const authStore = useAuthStore();
const enrollments = ref<any[]>([]);
const enrollmentsDataCache = useState("enrollmentsDash", () => null);

if (role === "REGISTRAR") {
  onMounted(async () => {
    await call({ registrar_id: authStore.user?.registrar_id });
    enrollmentsDataCache.value = data.value;
    enrollments.value = data.value || [];
  });
}
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
  &.image {
    background-image: url("~/assets/images/StudentImage.svg");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    padding: 20px;
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
  margin-top: 20px;
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
  // border: 1px solid $gray-300;
  border-radius: 10px;
}
.plain-box {
  background-color: $primary-color-600;
  border-radius: 10px;
}
.yellow-box {
  background-color: $warning-50;
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
  width: 5px;
  height: 50px;
  background-color: $primary-color-200;
  transition: background-color 0.2s ease;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;

  .green-box & {
    background-color: $success-400;
  }
  .blue-box & {
    background-color: $primary-color-400;
  }
  .grey-box & {
    background-color: $primary-color-600;
  }

  .card-suspended &,
  .card-deactivated & {
    background-color: $gray-200;
  }
}
.stat-divide {
  width: 15vw;
  height: 3px;
  background-color: $primary-color-600;
  transition: background-color 0.2s ease;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;

  .yellow-boxed & {
    background-color: $warning-500;
  }
}

.stat-item {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: $text-xs;
  line-height: 1.302;
  color: $gray-500;
  margin-bottom: 4px;
  white-space: nowrap;
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
.dialog-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;

  .dialog-icon {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: auto;
      height: 100px;
    }
  }

  .dialog-title {
    font-family: $font-family-heading;
    font-weight: 700;
    font-size: $text-xl;
    color: $gray-800;
    text-align: center;
    margin: 0;
  }

  .dialog-close {
    position: absolute;
    top: 0;
    right: 0;
    background: none;
    border: none;
    color: $gray-500;
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      background-color: $gray-100;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
}

.dialog-content {
  overflow-y: auto;

  .dialog-message {
    font-family: $font-family;
    font-size: $text-base;
    color: $gray-600;
    text-align: center;
    margin: 0;
    line-height: 1.6;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  width: 100%;

  > * {
    flex: 1;
    max-width: 80px;
  }

  button {
    border-radius: 12px;
  }
}
.roundedImage {
  border-radius: 50%;
  width: 100px;
  height: 100px;
}
.student-details {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
</style>
