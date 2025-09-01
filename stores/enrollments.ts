import { isArray, orderBy } from 'lodash-es';
import { useBackendRequest } from '~/composables/useBackendService';
import type { EnrollmentListType } from '~/types/enrollment';

export const useEnrollmentStore = defineStore(
  'enrollment',
  () => {
    const authStore = useAuthStore();
    const selectedEnrollmentSessionId = ref('');
    const enrollmentsResp = markRaw(
      useAsyncData(
        getCacheKeyFor(`enrollments`),
        async function () {
          const resp = await useBackendRequest<{
            status: 'success';
            data: EnrollmentListType[];
          }>({
            url: `/enrollments`,
            params: {
              student_id:
                authStore.role === 'STUDENT'
                  ? authStore.user?.student_id
                  : undefined,
              session_id: selectedEnrollmentSessionId.value
                ? Number(selectedEnrollmentSessionId.value)
                : undefined,
            },
            validateStatus(status) {
              return status < 400;
            },
          });

          const enrollments = resp.data?.data ?? [];
          return enrollments;
        },
        {
          watch: [() => authStore.token, selectedEnrollmentSessionId],
          deep: false,
          lazy: false,
          immediate: false,
          default() {
            return [] as EnrollmentListType[];
          },
          transform(list) {
            return orderBy(
              list,
              [
                (e) => new Date(e.updatedAt).getTime(),
                (e) => new Date(e.createdAt).getTime(),
              ],
              ['desc', 'desc'],
            );
          },
          getCachedData(key) {
            const enrollments =
              getCacheFromState<EnrollmentListType[]>(key);

            if (isArray(enrollments)) {
              return enrollments;
            }

            return undefined;
          },
        },
      ),
    );

    const getEnrollmentAsCourseListDataInStore = (
      enrollment: EnrollmentListType,
      enrollments?: EnrollmentListType[],
    ) => {
      const list = enrollments ?? enrollmentsResp.data.value ?? [];
      return getEnrollmentAsCourseListData(enrollment, list);
    };

    return {
      selectedEnrollmentSessionId,
      enrollmentsResp,
      getEnrollmentAsCourseListData:
        getEnrollmentAsCourseListDataInStore,
    };
  },
  {
    persist: {
      omit: ['enrollmentsResp'],
    },
  },
);
