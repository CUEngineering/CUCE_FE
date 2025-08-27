import { isArray, orderBy } from 'lodash-es';
import { useBackendRequest } from '~/composables/useBackendService';
import type { StudentCourseListType } from '~/types/course';
import type { EnrollmentListType } from '~/types/enrollment';

export const useStudentStore = defineStore(
  'student',
  () => {
    const authStore = useAuthStore();
    const coursesInCurrentSessionUrl = `/courses/eligible/${authStore.user?.student_id}`;
    const coursesInCurrentSessionResp = markRaw(
      useAsyncData(
        getCacheKeyFor(coursesInCurrentSessionUrl),
        async function () {
          if (!authStore.user?.student_id) {
            return [];
          }

          const resp = await useBackendRequest<{
            status: 'success';
            data: StudentCourseListType[];
          }>({
            url: coursesInCurrentSessionUrl,
            validateStatus(status) {
              return status < 400;
            },
          });

          const courses = resp.data?.data ?? [];
          return courses;
        },
        {
          watch: [() => authStore.token],
          deep: false,
          lazy: false,
          immediate: true,
          default() {
            return [] as StudentCourseListType[];
          },
          getCachedData(key) {
            const courses =
              getCacheFromState<StudentCourseListType[]>(key);
            if (isArray(courses)) {
              return courses;
            }

            return undefined;
          },
        },
      ),
    );

    const coursesInProgramUrl = `/courses/program/${authStore.user?.student_id}`;
    const coursesInProgramResp = markRaw(
      useAsyncData(
        getCacheKeyFor(coursesInProgramUrl),
        async function () {
          if (!authStore.user?.student_id) {
            return [];
          }

          const resp = await useBackendRequest<{
            status: 'success';
            data: StudentCourseListType[];
          }>({
            url: coursesInProgramUrl,
            validateStatus(status) {
              return status < 400;
            },
          });

          const courses = resp.data?.data ?? [];
          return courses;
        },
        {
          watch: [() => authStore.token],
          deep: false,
          lazy: false,
          immediate: true,
          default() {
            return [] as StudentCourseListType[];
          },
          getCachedData(key) {
            const courses =
              getCacheFromState<StudentCourseListType[]>(key);
            if (isArray(courses)) {
              return courses;
            }

            return undefined;
          },
        },
      ),
    );

    const selectedEnrollmentSessionId = ref('');
    const enrollmentsResp = markRaw(
      useAsyncData(
        async function () {
          if (!authStore.user?.student_id) {
            return [];
          }

          const resp = await useBackendRequest<{
            status: 'success';
            data: EnrollmentListType[];
          }>({
            url: `/enrollments`,
            params: {
              student_id: authStore.user.student_id,
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
      coursesInCurrentSessionResp,
      coursesInProgramResp,
      enrollmentsResp,
      getEnrollmentAsCourseListData:
        getEnrollmentAsCourseListDataInStore,
      selectedEnrollmentSessionId,
    };
  },
  {
    persist: {
      omit: [
        'coursesInCurrentSessionResp',
        'coursesInProgramResp',
        'enrollmentsResp',
      ],
    },
  },
);
