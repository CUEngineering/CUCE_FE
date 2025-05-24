import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useToast } from "@/composables/useToast";
import { compileScript } from "vue/compiler-sfc";

export const useBackendService = (endpoint: string, method: string) => {
  const config = useRuntimeConfig();

  const auth = useAuthStore();
  const router = useRouter();
  const toast = useToast();

  const isLoading = ref(false);
  const error = ref<any>(null);
  const data = ref<any>(null);
  const baseURL = config.public.apiBaseUrl;

  const call = async (payload: any = {}, customConfig: any = {}) => {
    const url = `${baseURL}/api/v1${endpoint}`;
    const headers: Record<string, any> = {
      ...customConfig.headers,
      Authorization: auth.token ? `Bearer ${auth.token}` : undefined,
    };

    if (payload instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    }

    isLoading.value = true;
    error.value = null;
    data.value = null;

    try {
      const response = await axios({
        url,
        method,
        data: ["post", "put", "patch"].includes(method) ? payload : undefined,
        params: ["get", "delete"].includes(method) ? payload : undefined,
        headers,
        ...customConfig,
      });

      data.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err;

      const msg = err?.response?.data?.message[0]?.toLowerCase();

      if (msg?.includes("unauthorized")) {
        toast.error("Session expired. Logging out...");
        auth.logout();
        router.push("/login");
      } else {
        toast.error(msg || "Something went wrong");
      }
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    call,
    isLoading,
    error,
    data,
  };
};
