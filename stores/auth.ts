// stores/auth.ts
import { defineStore } from "pinia";
import { useCookie } from "#app";

interface UserData {
  role: "ADMIN" | "REGISTRAR" | "STUDENT";
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
  reg_number?: string;
  program_id?: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null as string | null,
    role: null as UserData["role"] | null,
    user: null as UserData | null,
  }),
  actions: {
    setAuth(token: string, role: UserData["role"], user: UserData) {
      this.token = token;
      this.role = role;
      this.user = user;

      useCookie("token").value = token;
      useCookie("role").value = role;
      useCookie("user").value = JSON.stringify(user);
    },
    logout() {
      this.token = null;
      this.role = null;
      this.user = null;

      useCookie("token").value = null;
      useCookie("role").value = null;
      useCookie("user").value = null;
    },
  },
});
