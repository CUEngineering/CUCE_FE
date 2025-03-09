import { ref } from "vue";

interface ToastProps {
  id: number;
  message: string;
  title?: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  dismissible?: boolean;
  icon?: boolean;
}

type ToastOptions = Omit<ToastProps, "id">;

// Create a global state for toasts outside of the function
const toasts = ref<ToastProps[]>([]);
let toastCounter = 0;

export function useToast() {
  const addToast = (options: ToastOptions) => {
    const id = ++toastCounter;
    const toast: ToastProps = {
      id,
      ...options,
    };

    toasts.value.push(toast);
    return id;
  };

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (
    message: string,
    options?: Partial<Omit<ToastOptions, "message" | "type">>
  ) => {
    return addToast({
      message,
      type: "success",
      ...options,
    });
  };

  const error = (
    message: string,
    options?: Partial<Omit<ToastOptions, "message" | "type">>
  ) => {
    return addToast({
      message,
      type: "error",
      ...options,
    });
  };

  const warning = (
    message: string,
    options?: Partial<Omit<ToastOptions, "message" | "type">>
  ) => {
    return addToast({
      message,
      type: "warning",
      ...options,
    });
  };

  const info = (
    message: string,
    options?: Partial<Omit<ToastOptions, "message" | "type">>
  ) => {
    return addToast({
      message,
      type: "info",
      ...options,
    });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
