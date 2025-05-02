import { ref } from "vue";

// Interface for login request and response
interface SignInRequest {
  email: string;
  password: string;
}

interface SignInResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  session: {
    access_token: string;
    expires_in: number;
    refresh_token: string;
  };
}

export function useAuth() {
  const token = useCookie("auth_token", {
    // Add additional cookie options for security
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600, // 1 hour, matching the token expiration
  });

  // Define user type explicitly
  const user = ref<{
    id: string;
    email: string;
    role: string;
  } | null>(null);

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
      console.log("Attempting to sign in with:", {
        email: credentials.email,
        apiBaseUrl: apiBaseUrl,
      });

      const response = await fetch(`${apiBaseUrl}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Error response body:", errorBody);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`
        );
      }

      const data: SignInResponse = await response.json();

      console.log("Received login data:", {
        hasAccessToken: !!data.session?.access_token,
        hasUser: !!data.user,
      });

      // Ensure token and user are set correctly
      if (data.session?.access_token) {
        // Save token and user data
        token.value = data.session.access_token;
        user.value = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
        };

        console.log("Token after setting:", {
          tokenValue: token.value,
          isAuthenticated: isAuthenticated.value,
        });

        return { success: true, data };
      } else {
        console.error("No access token found in response", data);
        throw new Error("Authentication failed: No access token received");
      }
    } catch (err: any) {
      console.error("Sign in error details:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
      });

      error.value = err.message || "Failed to sign in";
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
