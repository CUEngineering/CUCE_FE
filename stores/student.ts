import { isArray, orderBy } from 'lodash-es';
import { useBackendRequest } from '~/composables/useBackendService';
import type { StudentCourseListType } from '~/types/course';
import type { StudentSessionType } from '~/types/session';
import type { StudentWithRegistrar } from '~/types/student';

export const useStudentStore = defineStore(
  'student',
  () => {
    const authStore = useAuthStore();
    const coursesInCurrentSessionUrl = computed(() =>
      authStore.role === 'STUDENT' && authStore.user?.student_id
        ? `/courses/eligible/${authStore.user?.student_id}`
        : undefined,
    );

    const coursesInCurrentSessionResp = markRaw(
      useAsyncData(
        getCacheKeyFor(`courses-in-current-session`),
        async function () {
          if (!coursesInCurrentSessionUrl.value) {
            return [];
          }

          const resp = await useBackendRequest<{
            status: 'success';
            data: StudentCourseListType[];
          }>({
            url: coursesInCurrentSessionUrl.value,
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

    const coursesInProgramUrl = computed(() =>
      authStore.role === 'STUDENT' && authStore.user?.student_id
        ? `/courses/program/${authStore.user?.student_id}`
        : undefined,
    );
    const coursesInProgramResp = markRaw(
      useAsyncData(
        getCacheKeyFor(`courses-in-program`),
        async function () {
          if (!coursesInProgramUrl.value) {
            return [];
          }

          const resp = await useBackendRequest<{
            status: 'success';
            data: StudentCourseListType[];
          }>({
            url: coursesInProgramUrl.value,
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

    const selectedStudentSessionId = ref('');
    const selectedStudentAssignedTo = ref<
      'all' | 'me' | 'others' | 'none'
    >('all');
    const sessionStudentsResp = markRaw(
      useAsyncData(
        getCacheKeyFor('session-student-list'),
        async function () {
          if (
            !(
              authStore.role &&
              ['ADMIN', 'REGISTRAR'].includes(authStore.role) &&
              selectedStudentSessionId.value &&
              !isNaN(Number(selectedStudentSessionId.value))
            )
          ) {
            return [];
          }

          const resp = await useBackendRequest<{
            status: 'success';
            data: StudentWithRegistrar[];
          }>({
            url: `/students/sessions/${selectedStudentSessionId.value}`,
            params: {
              assigned_to: selectedStudentAssignedTo.value || 'all',
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

    const allStudentsResp = markRaw(
      useAsyncData(
        getCacheKeyFor('all-student-list'),
        async function () {
          if (
            !(authStore.role && ['ADMIN'].includes(authStore.role))
          ) {
            return [];
          }

          const resp = await useBackendRequest<{
            status: 'success';
            data: StudentWithRegistrar[];
          }>({
            url: `/students`,
            validateStatus(status) {
              return status < 400;
            },
          });

          const students = resp.data?.data ?? [];
          return students;
        },
        {
          watch: [() => authStore.token],
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

    const selectedStudentId = ref<string | number | undefined>(
      undefined,
    );

    watch(
      [
        () =>
          authStore.role === 'STUDENT'
            ? authStore.user?.student_id
            : undefined,
        selectedStudentId,
      ],
      ([currentStudentId]) => {
        if (currentStudentId && !selectedStudentId.value) {
          selectedStudentId.value = currentStudentId;
        }
      },
      {
        immediate: true,
      },
    );

    const studentResp = markRaw(
      useAsyncData(
        getCacheKeyFor('single-student'),
        async function () {
          if (
            !(
              selectedStudentId.value &&
              authStore.role &&
              ['ADMIN', 'REGISTRAR'].includes(authStore.role)
            )
          ) {
            return undefined;
          }

          const resp = await useBackendRequest<{
            status: 'success';
            data: StudentWithRegistrar;
          }>({
            url: `/students/${selectedStudentId.value}`,
            validateStatus(status) {
              return status < 400;
            },
          });

          const student = resp.data?.data ?? undefined;
          return student;
        },
        {
          watch: [() => authStore.token, selectedStudentId],
          deep: false,
          lazy: false,
          immediate: false,
          getCachedData(key) {
            const student =
              getCacheFromState<StudentWithRegistrar>(key);

            if (student) {
              return student;
            }

            return undefined;
          },
        },
      ),
    );

    const studentSessionsResp = markRaw(
      useAsyncData(
        async function () {
          if (
            !(
              selectedStudentId.value &&
              authStore.role &&
              ['ADMIN', 'REGISTRAR'].includes(authStore.role)
            )
          ) {
            return [];
          }

          const resp = await useBackendRequest<{
            status: 'success';
            data: StudentSessionType[];
          }>({
            url: `/students/${selectedStudentId.value}/sessions`,
            validateStatus(status) {
              return status < 400;
            },
          });

          const sessions = resp.data?.data ?? [];
          return sessions;
        },
        {
          watch: [() => authStore.token, selectedStudentId],
          deep: false,
          lazy: false,
          immediate: false,
          default() {
            return [] as StudentSessionType[];
          },
          transform(list) {
            return orderBy(
              list,
              [
                (s) => (s.session_status === 'ACTIVE' ? 1 : 0),
                (s) => new Date(s.start_date).getTime(),
              ],
              ['desc', 'asc'],
            );
          },
          getCachedData(key) {
            const sessions =
              getCacheFromState<StudentSessionType[]>(key);

            if (isArray(sessions)) {
              return sessions;
            }

            return undefined;
          },
        },
      ),
    );

    const studentSessionCoursesResp = markRaw(
      useAsyncData(
        getCacheKeyFor('student-session-courses'),
        async function () {
          if (
            !(
              !isNaN(Number(selectedStudentSessionId.value)) &&
              selectedStudentId.value &&
              authStore.role &&
              ['ADMIN', 'REGISTRAR', 'STUDENT'].includes(
                authStore.role,
              )
            )
          ) {
            return [];
          }

          const resp = await useBackendRequest<{
            status: 'success';
            data: StudentCourseListType[];
          }>({
            url: `/students/${selectedStudentId.value}/session/${selectedStudentSessionId.value}/courses`,
            validateStatus(status) {
              return status < 400;
            },
          });

          const courses = resp.data?.data ?? [];
          console.log('courses here is ====> ', courses);
          return courses;
        },
        {
          watch: [
            () => authStore.token,
            selectedStudentId,
            selectedStudentSessionId,
          ],
          deep: false,
          lazy: false,
          immediate: false,
          default() {
            return [] as StudentCourseListType[];
          },
          transform(list) {
            return orderBy(
              list,
              [
                (c) => c.course_title,
                (c) => c.course_code,
                (s) => new Date(s.created_at).getTime(),
              ],
              ['asc', 'asc', 'desc'],
            );
          },
          getCachedData(key) {
            const courses =
              getCacheFromState<StudentCourseListType[]>(key);

            console.log('Courses from cache is ====> ', courses);

            if (isArray(courses)) {
              return courses;
            }

            return undefined;
          },
        },
      ),
    );

    const studentProgramCoursesResp = markRaw(
      useAsyncData(
        async function () {
          if (
            !(
              selectedStudentId.value &&
              authStore.role &&
              ['ADMIN', 'REGISTRAR', 'STUDENT'].includes(
                authStore.role,
              )
            )
          ) {
            return [];
          }

          const resp = await useBackendRequest<{
            status: 'success';
            data: StudentCourseListType[];
          }>({
            url: `/students/${selectedStudentId.value}/program/courses`,
            validateStatus(status) {
              return status < 400;
            },
          });

          const sessions = resp.data?.data ?? [];
          return sessions;
        },
        {
          watch: [() => authStore.token, selectedStudentId],
          deep: false,
          lazy: false,
          immediate: false,
          default() {
            return [] as StudentCourseListType[];
          },
          transform(list) {
            return orderBy(
              list,
              [
                (c) => c.course_title,
                (c) => c.course_code,
                (s) => new Date(s.created_at).getTime(),
              ],
              ['asc', 'asc', 'desc'],
            );
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

    const isShowingInviteModal = ref(false);
    const isShowingSuspendModal = ref(false);
    const isShowingClaimModal = ref(false);
    const isShowingDeleteModal = ref(false);

    return {
      coursesInCurrentSessionResp,
      coursesInProgramResp,
      selectedStudentSessionId,
      selectedStudentAssignedTo,
      sessionStudentsResp,
      allStudentsResp,
      selectedStudentId,
      studentResp,
      studentSessionsResp,
      studentSessionCoursesResp,
      studentProgramCoursesResp,
      isShowingInviteModal,
      isShowingSuspendModal,
      isShowingClaimModal,
      isShowingDeleteModal,
    };
  },
  {
    persist: {
      omit: [
        'coursesInCurrentSessionResp',
        'coursesInProgramResp',
        'isShowingInviteModal',
        'isShowingSuspendModal',
        'isShowingClaimModal',
        'isShowingDeleteModal',
        'selectedStudentId',
      ],
    },
  },
);
