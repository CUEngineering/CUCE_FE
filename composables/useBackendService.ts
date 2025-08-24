import { useToast } from '@/composables/useToast';
import { useAuthStore } from '@/stores/auth';
import axios, {
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
} from 'axios';
import { isObject, isString } from 'lodash-es';
import { ref } from 'vue';

export const createBackendAxiosInstance = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const toast = useToast();
  const baseURL = config.public.apiBaseUrl;
  const token = authStore.token ?? useCookie('token').value;

  const instance = axios.create({
    baseURL: `${baseURL}/api/v1`,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });

  instance.interceptors.response.use(
    function onFulfilled(response) {
      return response;
    },
    async function onRejected(error) {
      let msg = error?.response?.data?.message;
      if (isString(msg)) {
        msg = msg.toLowerCase();
      }

      console.log(msg);

      if (
        msg?.includes('unauthorized') ||
        msg?.includes('authentication')
      ) {
        toast.error('Session expired. Logging out...');
        await authStore.logout();
        setTimeout(async () => {
          await navigateTo({
            name: 'login',
          });
        }, 2000); // 2 seconds delay
      }

      throw error;
    },
  );

  return instance;
};

export const useBackendRequest = <Resp = unknown>(
  options: AxiosRequestConfig,
) => {
  const axiosInstance = createBackendAxiosInstance();
  const headers = {
    ...(options.headers ?? {}),
  } as unknown as AxiosRequestHeaders;

  if (options.data instanceof FormData) {
    headers['Content-Type'] = 'multipart/form-data';
  }

  const method = String(options.method ?? 'get').toLowerCase();

  return axiosInstance<Resp>({
    ...options,
    method,
    data: ['post', 'put', 'patch'].includes(method)
      ? options.data
      : undefined,
    headers,
  });
};

export const useBackendService = (
  endpoint: string,
  method: string,
) => {
  const config = useRuntimeConfig();

  const auth = useAuthStore();
  const toast = useToast();
  const token = useCookie('token').value;

  const isLoading = ref(false);
  const error = ref<any>(null);
  const data = ref<any>(null);
  const baseURL = config.public.apiBaseUrl;

  const call = async (
    payload: unknown = {},
    customConfig: Record<string, unknown> = {},
  ) => {
    const url = `${baseURL}/api/v1${endpoint}`;

    const headers = {
      ...(isObject(customConfig.headers) ? customConfig.headers : {}),
      Authorization: token ? `Bearer ${token}` : undefined,
    } as unknown as AxiosRequestHeaders;

    if (payload instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }

    isLoading.value = true;
    error.value = null;
    data.value = null;

    try {
      const response = await axios({
        url,
        method,
        data: ['post', 'put', 'patch'].includes(method)
          ? payload
          : undefined,
        params: ['get', 'delete'].includes(method)
          ? payload
          : undefined,
        ...customConfig,
        headers,
      });

      data.value = response.data.data;
      return response.data;
    } catch (err: any) {
      error.value = err;

      let msg = err?.response?.data?.message;
      if (isString(msg)) {
        msg = msg.toLowerCase();
      }

      console.log(msg);

      if (
        msg?.includes('unauthorized') ||
        msg?.includes('authentication')
      ) {
        toast.error('Session expired. Logging out...');
        await auth.logout();
        setTimeout(async () => {
          await navigateTo({
            name: 'login',
          });
        }, 2000); // 2 seconds delay
      } else if (!msg || msg.length <= 1) {
        if (err?.response?.data?.message.includes('JWT')) {
          toast.error('Session expired. Logging out...');
          await auth.logout();
          setTimeout(async () => {
            await navigateTo({
              name: 'login',
            });
          }, 2000); // 2 seconds delay
        }

        toast.error('Something went wrong');
      } else {
        // toast.error(msg || "Something went wrong");
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
