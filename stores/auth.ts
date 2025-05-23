// stores/auth.ts
import { defineStore } from "pinia";
import { useCookie } from "#app";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null as string | null,
    role: null as "ADMIN" | "REGISTRAR" | "STUDENT" | null,
  }),
  actions: {
    setAuth(token: string, role: string) {
      this.token = token;
      this.role = role as any;

      useCookie("token").value = token;
      useCookie("role").value = role;
    },
    logout() {
      this.token = null;
      this.role = null;
      useCookie("token").value = null;
      useCookie("role").value = null;
    },
  },
});
