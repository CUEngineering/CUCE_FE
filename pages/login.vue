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
              :error="emailError"
            />

            <FormInput
              id="password"
              label="Password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              required
              :error="passwordError"
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
              <a href="forgotpassword" class="forgot-password"
                >Forgot Password?</a
              >
            </div>

            <Button type="submit" variant="primary" :loading="isLoading">
              {{ isLoading ? "Signing in..." : "Sign In" }}
            </Button>

            <div v-if="authError" class="error-message">
              {{ authError }}
            </div>
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
        <div class="circles top-left-circle"></div>
        <div class="circles bottom-right-circle"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import EyeIcon from "~/components/icons/EyeIcon.vue";
import EyeOffIcon from "~/components/icons/EyeOffIcon.vue";
import Logo from "~/components/Logo.vue";
import Button from "~/components/ui/Button.vue";
import Carousel from "~/components/ui/Carousel.vue";
import FormInput from "~/components/ui/FormInput.vue";
import { useBackendService } from "~/composables/useBackendService";

// State
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const showPassword = ref(false);
const authError = ref("");
const emailError = ref("");
const passwordError = ref("");

// Store and router
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const validateEmail = (value: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value);
};

onMounted(() => {
  authStore.logout();
});

const { call, isLoading, error, data } = useBackendService(
  "/auth/signin",
  "post"
);

const handleLogin = async () => {
  emailError.value = "";
  passwordError.value = "";
  authError.value = "";

  // Field validation
  if (!email.value) {
    emailError.value = "Email is required.";
  } else if (!validateEmail(email.value)) {
    emailError.value = "Enter a valid email address.";
  }

  if (!password.value) {
    passwordError.value = "Password is required.";
  } else if (password.value.length < 8) {
    passwordError.value = "Password must not be lesser than 8 characters.";
  }

  if (emailError.value || passwordError.value) return;

  try {
    await call({
      email: email.value,
      password: password.value,
    });
    console.log(data.value);

    authStore.setAuth(
      data.value.session.access_token,
      data.value.role,
      data.value.user
    );

    toast.success("Login successful!");
    switch (data.value.role) {
      case "REGISTRAR":
        router.push("/registrar/dashboard");
        break;
      case "STUDENT":
        router.push("/student/dashboard");
        break;
      case "ADMIN":
        router.push("/admin/dashboard");
        break;
    }
  } catch (err: any) {
    console.log(err);
    authError.value = "Invalid email or password";
    emailError.value = " ";
    passwordError.value = " ";
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
