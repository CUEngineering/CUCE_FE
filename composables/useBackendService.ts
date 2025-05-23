import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const config = useRuntimeConfig();
const baseURL = config.public.apiBaseUrl;

export const useBackendService = (endpoint: string, method: string) => {
  const auth = useAuthStore();
  const router = useRouter();
  const toast = useToast();

  const call = async (payload: any = {}, config: any = {}) => {
    const url = `${baseURL}${endpoint}`;
    const headers: Record<string, any> = {
      ...config.headers,
      Authorization: auth.token ? `Bearer ${auth.token}` : undefined,
    };

    if (payload instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    }

    try {
      const response = await axios({
        url,
        method,
        data: ["post", "put", "patch"].includes(method) ? payload : undefined,
        params: ["get", "delete"].includes(method) ? payload : undefined,
        headers,
        ...config,
      });
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message?.toLowerCase();
      if (msg?.includes("unauthorized")) {
        toast.error("Session expired. Logging out...");
        auth.logout();
        router.push("/login");
      } else {
        toast.error(msg || "Something went wrong");
      }
      throw error;
    }
  };

  return { call };
};
