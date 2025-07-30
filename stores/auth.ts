// stores/auth.ts
import { useCookie } from "#app";
import { defineStore } from "pinia";

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
  reg_number?: string;
  program_id?: string;
  admin_id: number;
  registrar_id: number;
  student_id: number;
  program: any;
}
interface Role {}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null as string | null,
    role: null as string | null,
    user: null as UserData | null,
  }),
  actions: {
    setAuth(token: string, role: string, user: UserData) {
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
  persist: true,
});
