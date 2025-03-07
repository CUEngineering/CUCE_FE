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
                  <span v-if="showPassword">Hide</span>
                  <span v-else>Show</span>
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

            <button type="submit" class="sign-in-button" :disabled="loading">
              {{ loading ? "Signing in..." : "Sign In" }}
            </button>
          </form>
        </div>

        <!-- Copyright -->
        <div class="copyright">
          <p>© 2024 Charisma All rights reserved</p>
        </div>
      </div>

      <!-- Right Side Content -->
      <div class="feature-content">
        <div class="gradient-blur gradient-blur-1"></div>
        <div class="gradient-blur gradient-blur-2"></div>
        <div class="gradient-blur gradient-blur-3"></div>
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
@use "@/assets/scss/main" as *;

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
    font-family: "Plus Jakarta Sans", sans-serif;
    font-size: 2rem;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 0.5rem;
  }
  p {
    font-family: "DM Sans", sans-serif;
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
    font-family: "DM Sans", sans-serif;

    input[type="checkbox"] {
      width: auto;
    }
  }

  .forgot-password {
    font-family: "DM Sans", sans-serif;
    color: $primary-color;
    text-decoration: none;
    font-size: 0.875rem;
    &:hover {
      text-decoration: underline;
    }
  }
}

.sign-in-button {
  width: 100%;
  padding: 0.875rem;
  background-color: $primary-color;
  color: white;
  font-family: "DM Sans", sans-serif;
  font-weight: 500;
  border-radius: 0.5rem;

  &:hover:not(:disabled) {
    background-color: darken-color($primary-color, 5%);
  }
}

.copyright {
  flex-shrink: 0;
  text-align: center;
  color: #6b7280;
  font-family: "DM Sans", sans-serif;
  font-size: 0.875rem;
  padding-bottom: 2rem;
}

.feature-content {
  background: #1a365d; // Darker blue base
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.gradient-blur {
  position: absolute;
  z-index: 0;
}

.gradient-blur-1 {
  width: 120%;
  height: 120%;
  background: radial-gradient(
    circle at top right,
    rgba(147, 197, 253, 0.5),
    // Bright blue
    transparent 70%
  );
  top: -10%;
  right: -10%;
  transform: rotate(-15deg);
  opacity: 0.8;
}

.gradient-blur-2 {
  width: 120%;
  height: 120%;
  background: radial-gradient(
    circle at bottom left,
    rgba(249, 168, 212, 0.4),
    // Pink
    transparent 70%
  );
  bottom: -10%;
  left: -10%;
  transform: rotate(15deg);
  opacity: 0.7;
}

.gradient-blur-3 {
  width: 150%;
  height: 150%;
  background: radial-gradient(
    ellipse at center,
    rgba(124, 58, 237, 0.3),
    // Purple
    transparent 70%
  );
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.6;
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
