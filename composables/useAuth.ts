import { ref } from "vue";

// Interface for login request and response
interface SignInRequest {
  email: string;
  password: string;
}

interface SignInResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function useAuth() {
  const token = useCookie("auth_token");
  const user = ref(null);
  const isAuthenticated = computed(() => !!token.value);
  const error = ref("");
  const loading = ref(false);

  // Get the API base URL from environment config
  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;

  async function signIn(credentials: SignInRequest) {
    loading.value = true;
    error.value = "";

    try {
      const response = await fetch(`${apiBaseUrl}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to sign in");
      }

      const data: SignInResponse = await response.json();

      // Save token and user data
      token.value = data.token;
      user.value = data.user;

      return { success: true, data };
    } catch (err) {
      error.value = err.message || "An error occurred during sign in";
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  function signOut() {
    token.value = null;
    user.value = null;
    navigateTo("/login");
  }

  return {
    signIn,
    signOut,
    user,
    token,
    isAuthenticated,
    error,
    loading,
  };
}
