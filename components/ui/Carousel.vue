<template>
  <div class="carousel">
    <div
      class="carousel-content"
      :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
    >
      <div class="carousel-slide">
        <div class="preview-card">
          <div class="preview-image enrollment-preview">
            <!-- Placeholder for enrollment dashboard preview -->
            <div class="mock-dashboard">
              <div class="mock-header"></div>
              <div class="mock-content">
                <div class="mock-table">
                  <div class="mock-row" v-for="i in 4" :key="i"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h2>Manage Enrolments</h2>
        <p>
          Guide students through their academic journey. Approve course
          enrolments and manage a dedicated group of students.
        </p>
      </div>
      <div class="carousel-slide">
        <div class="preview-card">
          <div class="preview-image progress-preview">
            <!-- Placeholder for progress tracking preview -->
            <div class="mock-dashboard">
              <div class="mock-stats">
                <div class="mock-stat" v-for="i in 3" :key="i"></div>
              </div>
              <div class="mock-chart"></div>
            </div>
          </div>
        </div>
        <h2>Track Progress</h2>
        <p>
          Monitor student progress, view academic performance, and provide
          timely feedback to support their learning journey.
        </p>
      </div>
      <div class="carousel-slide">
        <div class="preview-card">
          <div class="preview-image course-preview">
            <!-- Placeholder for course management preview -->
            <div class="mock-dashboard">
              <div class="mock-grid">
                <div class="mock-card" v-for="i in 6" :key="i"></div>
              </div>
            </div>
          </div>
        </div>
        <h2>Course Management</h2>
        <p>
          Efficiently manage course schedules, materials, and resources. Keep
          everything organized in one place.
        </p>
      </div>
    </div>
    <div class="carousel-dots">
      <button
        v-for="i in 3"
        :key="i"
        class="dot"
        :class="{ active: currentSlide === i - 1 }"
        @click="currentSlide = i - 1"
      ></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const currentSlide = ref(0);
const timer = ref<number>();

const startAutoplay = () => {
  timer.value = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % 3;
  }, 5000);
};

onMounted(() => {
  startAutoplay();
});

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<style lang="scss" scoped>
.carousel {
  width: 100%;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.carousel-content {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

.carousel-slide {
  min-width: 100%;
  padding: 2rem;
  text-align: center;

  h2 {
    font-family: "Plus Jakarta Sans", sans-serif;
    font-size: 1.875rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: white;
  }

  p {
    font-family: "DM Sans", sans-serif;
    margin-bottom: 2rem;
    opacity: 0.9;
    color: white;
    line-height: 1.6;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
}

.preview-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(8px);
}

.preview-image {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.mock-dashboard {
  padding: 1rem;
  height: 100%;
}

.mock-header {
  height: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

.mock-content {
  height: calc(100% - 3rem);
}

.mock-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
}

.mock-row {
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
}

.mock-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.mock-stat {
  height: 4rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
}

.mock-chart {
  height: calc(100% - 5rem);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
}

.mock-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  height: 100%;
}

.mock-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  aspect-ratio: 4/3;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;

  .dot {
    width: 2rem;
    height: 0.25rem;
    background: rgba(255, 255, 255, 0.3);
    border: none;
    border-radius: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &.active {
      background: white;
    }
  }
}
</style>
