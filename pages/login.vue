<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-content">
        <!-- Logo -->
        <div class="logo-wrapper">
          <Logo />
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Welcome Text -->
          <div class="welcome-text">
            <h1>Welcome back</h1>
            <p>Let's get you signed in</p>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="login-form">
            <FormInput
              id="email"
              label="Email address"
              v-model="email"
              type="email"
              placeholder="Enter email address"
              required
            />

            <FormInput
              id="password"
              label="Password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              required
            >
              <template #button>
                <button
                  type="button"
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                >
                  <EyeIcon v-if="showPassword" />
                  <EyeOffIcon v-else />
                </button>
              </template>
            </FormInput>

            <div class="form-options">
              <label class="remember-me">
                <input type="checkbox" v-model="rememberMe" />
                <span>Remember me</span>
              </label>
              <a href="#" class="forgot-password">Forgot Password?</a>
            </div>

            <Button type="submit" variant="primary" :loading="loading">
              {{ loading ? "Signing in..." : "Sign In" }}
            </Button>
          </form>
        </div>

        <!-- Copyright -->
        <div class="copyright">
          <p>© 2024 Charisma All rights reserved</p>
        </div>
      </div>

      <!-- Right Side Content -->
      <div class="feature-content">
        <div class="gradient-blur"></div>
        <Carousel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Logo from "~/components/Logo.vue";
import FormInput from "~/components/ui/FormInput.vue";
import Carousel from "~/components/ui/Carousel.vue";
import EyeIcon from "~/components/icons/EyeIcon.vue";
import EyeOffIcon from "~/components/icons/EyeOffIcon.vue";
import Button from "~/components/ui/Button.vue";

const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const showPassword = ref(false);
const loading = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;
    // Add login logic here
  } catch (error) {
    console.error("Login error:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: stretch;
  background-color: #f3f4f6;
  overflow: hidden;
}

.login-container {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: white;
}

.login-content {
  padding: 2rem 4rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
}

.logo-wrapper {
  flex-shrink: 0;
  padding-top: 2rem;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;
}

.welcome-text {
  margin-bottom: 2rem;
  h1 {
    font-family: $font-family-heading;
    font-size: 2rem;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 0.5rem;
  }
  p {
    font-family: $font-family-body;
    color: #6b7280;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .remember-me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: $font-family-body;

    input[type="checkbox"] {
      width: auto;
    }
  }

  .forgot-password {
    font-family: $font-family-body;
    color: $primary-color;
    text-decoration: none;
    font-size: 0.875rem;
    &:hover {
      text-decoration: underline;
    }
  }
}

.copyright {
  flex-shrink: 0;
  text-align: center;
  color: #6b7280;
  font-family: $font-family-body;
  font-size: 0.875rem;
  padding-bottom: 2rem;
}

.feature-content {
  background: #1e40af; // Darker blue from the design
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.gradient-blur {
  position: absolute;
  inset: 0;
  opacity: 0.9;
  background: radial-gradient(
      circle at 75% 25%,
      rgba(96, 165, 250, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 25% 75%,
      rgba(96, 165, 250, 0.15) 0%,
      transparent 50%
    ),
    linear-gradient(35deg, rgba(37, 99, 235, 0.3) 0%, transparent 50%),
    linear-gradient(215deg, rgba(37, 99, 235, 0.3) 0%, transparent 50%),
    repeating-linear-gradient(
      to right,
      transparent 0px,
      transparent 100px,
      rgba(255, 255, 255, 0.03) 100px,
      rgba(255, 255, 255, 0.03) 102px
    ),
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 100px,
      rgba(255, 255, 255, 0.03) 100px,
      rgba(255, 255, 255, 0.03) 102px
    );
  mix-blend-mode: soft-light;
  pointer-events: none;
}

.gradient-blur::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
      circle at 80% 20%,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 25%
    ),
    radial-gradient(
      circle at 20% 80%,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 25%
    );
  opacity: 0.7;
  pointer-events: none;
}

.gradient-blur::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
      circle at 70% 30%,
      rgba(255, 255, 255, 0.08) 0%,
      transparent 8px
    ),
    radial-gradient(
      circle at 30% 70%,
      rgba(255, 255, 255, 0.08) 0%,
      transparent 8px
    ),
    radial-gradient(
      circle at 40% 40%,
      rgba(255, 255, 255, 0.08) 0%,
      transparent 8px
    ),
    radial-gradient(
      circle at 60% 60%,
      rgba(255, 255, 255, 0.08) 0%,
      transparent 8px
    );
  background-size: 300px 300px;
  background-position: 0 0, 0 0, 150px 150px, 150px 150px;
  background-repeat: repeat;
  opacity: 0.5;
  pointer-events: none;
}

@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

.gradient-blur {
  animation: pulse 12s ease-in-out infinite;
}

.toggle-password {
  color: #6b7280;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;

  &:hover {
    color: $text-color;
  }
}

@media (max-width: $breakpoint-lg) {
  .login-container {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 100vh;
  }

  .login-content {
    padding: 2rem;
  }

  .feature-content {
    display: none;
  }
}
</style>
