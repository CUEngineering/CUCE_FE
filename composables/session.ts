import { isArray } from 'lodash-es';
import type { SessionFilterType } from '~/types/session';

export const useSessionsFilter = () => {
  const authStore = useAuthStore();

  return markRaw(
    useAsyncData(
      getCacheKeyFor(`sessions/filter`),
      async function () {
        if (!authStore.user) {
          return [];
        }

        const resp = await useBackendRequest<{
          status: 'success';
          data: SessionFilterType[];
        }>({
          url: 'sessions/filter',
          validateStatus(status) {
            return status < 400;
          },
        });

        const sessions = resp.data?.data ?? [];
        return sessions;
      },
      {
        watch: [() => authStore.token],
        deep: false,
        lazy: true,
        immediate: true,
        transform(list) {
          return list.map((session) => {
            if (session.session_status === 'ACTIVE') {
              session.session_name = `${session.session_name} (Current)`;
            }

            return session;
          });
        },
        default() {
          return [] as SessionFilterType[];
        },
        getCachedData(key) {
          const sessions =
            getCacheFromState<SessionFilterType[]>(key);

          if (isArray(sessions)) {
            return sessions;
          }

          return undefined;
        },
      },
    ),
  );
};
