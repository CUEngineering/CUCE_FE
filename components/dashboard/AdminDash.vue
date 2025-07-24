<template>
  <div class="registrar-card" :style="cardStyle">
    <div class="registrar-header">
      <div
        v-if="clickType === 'text'"
        @click="handleRoute"
        class="registrar-avatar"
        :style="{ color: color }"
      >
        {{ clickLabel }}
      </div>
      <div v-else class="registrar-avatar">
        {{ clickLabel }}
      </div>
    </div>

    <div class="registrar-stats">
      <div class="stat-group">
        <div class="stat-item">
          <div class="stat-label">{{ statLabel }}</div>
          <div style="display: flex; align-items: center" class="stat-value">
            <span style="margin-right: 5px; color: gray"> {{ statValue }}</span>
            <Question style="margin-right: 5px" v-if="showQuestionIcon" />
            <Dot style="margin-right: 5px" v-if="showDotIcon" />
            {{ number }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import Dot from "../icons/Dot.vue";
import Question from "../icons/Question.vue";

// Props
const props = defineProps<{
  clickType?: "text" | "button";
  clickLabel?: string;
  statLabel?: string;
  statValue?: string;
  number?: number;
  showDotIcon?: boolean;
  showQuestionIcon?: boolean;
  bgImage?: string;
  color?: string;
  route?: string;
}>();

const router = useRouter();

const handleRoute = () => {
  router.push(`${props.route}`);
};

const cardStyle = computed(() => {
  return props.bgImage
    ? {
        backgroundImage: `url(${props.bgImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};
});
</script>

<style lang="scss" scoped>
.registrar-card {
  border-radius: 12px;
  padding: 16px;
  box-shadow: none;
  position: relative;
  width: 100%;
  transition: all 0.2s ease-in-out;
}

.registrar-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 48px;
  gap: 16px;
  width: 100%;
  cursor: pointer;
}

.registrar-avatar {
  flex-shrink: 0;
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

.stat-item {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-weight: bold;
  font-size: $text-lg;
  line-height: 1.302;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
