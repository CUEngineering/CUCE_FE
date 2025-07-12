<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-content">
        <div class="logo-wrapper">
          <Logo />
        </div>

        <div class="main-content">
          <div class="welcome-text">
            <h1>Forgot Password</h1>
            <p>Enter your email to receive a 6-digit reset code</p>
          </div>

          <form @submit.prevent="handleForgotPassword" class="login-form">
            <FormInput
              id="email"
              label="Email address"
              v-model="email"
              type="email"
              placeholder="Enter email address"
              required
              :error="authError"
            />

            <Button type="submit" variant="primary" :loading="isLoading">
              {{ isLoading ? "Sending..." : "Send Reset Code" }}
            </Button>

            <div v-if="authError" class="error-message">
              {{ authError }}
            </div>
          </form>
        </div>

        <div class="copyright">
          <p>© 2025 Charisma All rights reserved</p>
        </div>
      </div>

      <div class="feature-content">
        <div class="gradient-blur"></div>
        <Carousel />
        <div class="circles top-left-circle"></div>
        <div class="circles bottom-right-circle"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import Logo from "~/components/Logo.vue";
import Button from "~/components/ui/Button.vue";
import Carousel from "~/components/ui/Carousel.vue";
import FormInput from "~/components/ui/FormInput.vue";
import { useBackendService } from "~/composables/useBackendService";
import { useToast } from "~/composables/useToast";

const email = ref("");
const authError = ref("");
const toast = useToast();
const router = useRouter();

const { call, isLoading } = useBackendService("/auth/forgot-password", "post");

const handleForgotPassword = async () => {
  authError.value = "";
  if (!email.value) {
    authError.value = "Email is required.";
    return;
  }

  try {
    await call({ email: email.value });
    toast.success("Reset code sent to your email.");
    router.push({ path: "/resetpassword", query: { email: email.value } });
  } catch (err: any) {
    console.log(err);
    authError.value = "Failed to send reset code.";
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: stretch;
  background-color: $gray-100;
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
  max-width: 560px;
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
    font-size: $text-4xl;
    font-weight: 700;
    color: $text-color;
    margin-bottom: 0.5rem;
  }
  p {
    font-family: $font-family;
    color: $gray-600;
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
    font-family: $font-family;
    font-size: $text-sm;
    input[type="checkbox"] {
      width: auto;
    }
  }

  .forgot-password {
    font-family: $font-family;
    color: $primary-color;
    text-decoration: none;
    font-size: $text-sm;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
}

.copyright {
  flex-shrink: 0;
  text-align: center;
  color: $gray-600;
  font-family: $font-family;
  font-size: $text-sm;
  padding-bottom: 2rem;
}

.feature-content {
  background: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin: 20px;
  border-radius: 40px;

  .circles {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: $white;
    z-index: 1;

    &.top-left-circle {
      top: 10%;
      left: -40px;
    }
    &.bottom-right-circle {
      bottom: 10%;
      right: -40px;
    }
  }
}

.gradient-blur {
  position: absolute;
  inset: 0;
  opacity: 0.95;
  background: url("@/assets/images/BG_Image.png") center/cover no-repeat;
  mix-blend-mode: normal;
  pointer-events: none;
  filter: contrast(1.1) blur(20px);
  transform-origin: center;
  animation: float 0.8s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0) scale(1) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) scale(1.01) rotate(1deg);
  }
  100% {
    transform: translateY(0) scale(1) rotate(0deg);
  }
}

.toggle-password {
  color: $gray-600;
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

.error-message {
  color: $error-500;
  font-size: $text-sm;
  margin-top: 0.5rem;
  text-align: center;
}
</style>
