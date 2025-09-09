import { useTimeoutPoll } from '@vueuse/core';
import { isPast } from 'date-fns';
import { useBackendRequest } from '~/composables/useBackendService';
import type { SessionType } from '~/types/session';

export const useSessionStore = defineStore(
  'session',
  () => {
    const authStore = useAuthStore();
    const activeSessionResp = markRaw(
      useAsyncData(
        async function () {
          if (
            !(
              authStore.role &&
              ['ADMIN', 'REGISTRAR', 'STUDENT'].includes(
                authStore.role,
              )
            )
          ) {
            return undefined;
          }

          const resp = await useBackendRequest<{
            status: 'success';
            data: SessionType;
          }>({
            url: `/sessions/active`,
            validateStatus(status) {
              return status < 400;
            },
          });

          const activeSession = resp.data?.data ?? undefined;
          return activeSession;
        },
        {
          watch: [() => authStore.token],
          deep: false,
          lazy: false,
          immediate: false,
          transform(activeSession) {
            if (!activeSession) {
              return undefined;
            }

            activeSession.enrollment_deadline = new Date(
              activeSession.enrollment_deadline,
            );
            activeSession.start_date = new Date(
              activeSession.start_date,
            );
            activeSession.end_date = new Date(activeSession.end_date);

            return activeSession;
          },
          getCachedData(key) {
            const activeSession = getCacheFromState<SessionType>(key);

            return activeSession ?? undefined;
          },
        },
      ),
    );

    const activeSessionPoll = useTimeoutPoll(
      () => activeSessionResp.execute({ dedupe: 'cancel' }),
      10000,
      {
        immediateCallback: true,
      },
    );

    const hasSessionEnrollmentDeadlinePassed = computed(() =>
      activeSessionResp.data.value
        ? isPast(activeSessionResp.data.value.enrollment_deadline)
        : true,
    );

    return {
      activeSessionResp,
      activeSessionPoll,
      hasSessionEnrollmentDeadlinePassed,
    };
  },
  {
    persist: {
      omit: ['activeSessionResp'],
    },
  },
);
