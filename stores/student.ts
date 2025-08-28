import { isArray, orderBy } from 'lodash-es';
import { useBackendRequest } from '~/composables/useBackendService';
import type { StudentCourseListType } from '~/types/course';
import type { EnrollmentListType } from '~/types/enrollment';
import type { StudentWithRegistrar } from '~/types/student';

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

    const selectedStudentSessionId = ref('all');
    const selectedStudentAssignedTo = ref<
      'all' | 'me' | 'others' | 'none'
    >('all');
    const studentsResp = markRaw(
      useAsyncData(
        async function () {
          if (
            !(
              authStore.role &&
              ['ADMIN', 'REGISTRAR'].includes(authStore.role)
            )
          ) {
            return [];
          }

          const resp = await useBackendRequest<{
            status: 'success';
            data: StudentWithRegistrar[];
          }>({
            url: `/students`,
            params: {
              assigned_to: selectedStudentAssignedTo.value || 'all',
              session_id: selectedStudentSessionId.value
                ? selectedStudentSessionId.value === 'all'
                  ? undefined
                  : String(selectedStudentSessionId.value)
                : undefined,
            },
            validateStatus(status) {
              return status < 400;
            },
          });

          const students = resp.data?.data ?? [];
          return students;
        },
        {
          watch: [
            () => authStore.token,
            selectedStudentSessionId,
            selectedStudentAssignedTo,
          ],
          deep: false,
          lazy: false,
          immediate: false,
          default() {
            return [] as StudentWithRegistrar[];
          },
          transform(list) {
            return orderBy(
              list,
              [
                (s) => (s.can_claim ? 1 : 0),
                (s) => new Date(s.updated_at).getTime(),
                (s) => new Date(s.created_at).getTime(),
              ],
              ['desc', 'desc', 'desc'],
            );
          },
          getCachedData(key) {
            const students =
              getCacheFromState<StudentWithRegistrar[]>(key);

            if (isArray(students)) {
              return students;
            }

            return undefined;
          },
        },
      ),
    );

    return {
      coursesInCurrentSessionResp,
      coursesInProgramResp,
      enrollmentsResp,
      getEnrollmentAsCourseListData:
        getEnrollmentAsCourseListDataInStore,
      selectedEnrollmentSessionId,
      selectedStudentSessionId,
      selectedStudentAssignedTo,
      studentsResp,
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
