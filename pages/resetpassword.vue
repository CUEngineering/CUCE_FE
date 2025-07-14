<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-content">
        <div class="logo-wrapper">
          <Logo />
        </div>

        <div class="main-content">
          <div class="welcome-text">
            <h1>Reset Password</h1>
            <p>Enter the 6-digit code and your new password</p>
          </div>

          <form @submit.prevent="handleResetPassword" class="login-form">
            <div class="otp-inputs">
              <input
                v-for="(digit, index) in otp"
                :key="index"
                type="text"
                maxlength="1"
                class="otp-box"
                v-model="otp[index]"
                @input="focusNext(index)"
              />
            </div>

            <FormInput
              id="password"
              label="New Password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your new password"
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

            <Button type="submit" variant="primary" :loading="isLoading">
              {{ isLoading ? "Resetting..." : "Reset Password" }}
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
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import EyeIcon from "~/components/icons/EyeIcon.vue";
import EyeOffIcon from "~/components/icons/EyeOffIcon.vue";
import Logo from "~/components/Logo.vue";
import Button from "~/components/ui/Button.vue";
import Carousel from "~/components/ui/Carousel.vue";
import FormInput from "~/components/ui/FormInput.vue";
import { useBackendService } from "~/composables/useBackendService";
import { useToast } from "~/composables/useToast";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const otp = ref(["", "", "", "", "", ""]);
const password = ref("");
const showPassword = ref(false);
const authError = ref("");

const email = ref("");
onMounted(() => {
  email.value = (route.query.email as string) || "mayf@io.com";
});

const { call, isLoading } = useBackendService("/auth/reset-password", "post");

const focusNext = (index: number) => {
  const inputs = document.querySelectorAll(".otp-box");
  const current = inputs[index] as HTMLInputElement;
  if (current.value.length === 1 && index < 5) {
    const next = inputs[index + 1] as HTMLInputElement;
    next.focus();
  }
};

const handleResetPassword = async () => {
  authError.value = "";
  const code = otp.value.join("").trim();
  if (code.length !== 6 || !password.value || !email.value) {
    authError.value = "Please enter the 6-digit code and new password.";
    return;
  }
  if (password.value.length < 8) {
    authError.value = "Password must be at least 8 characters long.";
    return;
  }

  try {
    await call({
      email: email.value,
      token: code,
      newPassword: password.value,
    });

    toast.success("Password reset successfully!");
    router.push("/login");
  } catch (err: any) {
    authError.value = "Invalid code or password reset failed.";
  }
};
</script>

<style scoped lang="scss">
.otp-inputs {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.5rem;

  .otp-box {
    width: 2.5rem;
    height: 3rem;
    font-size: 1.25rem;
    text-align: center;
    border: 1px solid $gray-300;
    border-radius: 0.375rem;
    outline: none;

    &:focus {
      border-color: $primary-color;
    }
  }
}

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
