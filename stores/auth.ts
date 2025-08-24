// stores/auth.ts
import { useCookie } from '#app';
import { defineStore } from 'pinia';

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

export const useAuthStore = defineStore(
  'auth',
  () => {
    const state = reactive({
      token: null as string | null,
      role: null as 'ADMIN' | 'REGISTRAR' | 'STUDENT' | null,
      user: null as UserData | null,
    });

    async function clearAllCaches() {
      useState('sessionDataCa').value = null;
      useState('closedSessionCa').value = null;
      useState('enrollments').value = null;
      useState('courseCacheData').value = null;
      useState('programDetailsDataCache').value = null;
      useState('idCourse').value = null;
      useState('studentLoad').value = null;
      useState('sessionLoad').value = null;
      useState('courseData').value = null;
      useState('dashboard-stats').value = null;
      useState('enrollmentsAdmin').value = null;
      useState('coursesData').value = null;
      useState('programDetailsData').value = null;
      useState('id-stats').value = null;
      useState('studentsData').value = null;
      useState('programsDataCache').value = null;
      useState('registrarData').value = null;
      useState('inviteData').value = null;
      useState('callCache').value = null;
      useState('courseCallCache').value = null;
      useState('studentCallCache').value = null;
      useState('sessionDataCah').value = null;
      useState('closedSessionCah').value = null;
      useState('studentscachT').value = null;
      useState('statsRTD').value = null;
      useState('enrollmentsREG').value = null;
      useState('studentscachTREG').value = null;
      useState('courseDataSTD').value = null;
    }

    async function setAuth(
      token: string,
      role: 'ADMIN' | 'REGISTRAR' | 'STUDENT',
      user: UserData,
    ) {
      state.token = token;
      state.role = role;
      state.user = user;

      useCookie('token').value = token;
      useCookie('role').value = role;
      useCookie('user').value = JSON.stringify(user);
      await nextTick();

      console.log('Called Set Auth');
    }

    async function logout() {
      state.token = null;
      state.role = null;
      state.user = null;

      useCookie('token').value = null;
      useCookie('role').value = null;
      useCookie('user').value = null;

      await clearAllCaches();
      await nextTick();

      console.trace('Called Logout');
    }

    return {
      ...toRefs(state),
      clearAllCaches,
      setAuth,
      logout,
    };
  },
  {
    persist: true,
  },
);
