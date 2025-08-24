import type { StudentCourseListType } from '~/types/course';
import type {
  EnrollmentListType,
  EnrollmentType,
} from '~/types/enrollment';

export const getEnrollmentAsCourseListData = (
  enrollment: EnrollmentListType,
  enrollments: EnrollmentListType[],
) => {
  const list = enrollments ?? [];
  const activeSessionIds = list
    .map((e) => (e.isActiveSession ? String(e.sessionId) : ''))
    .filter((id) => !!id);

  const sameStudentCourseEnrollements = list
    .filter((e) => {
      return (
        e.courseId === enrollment.courseId &&
        e.sessionId === enrollment.sessionId &&
        e.studentId === enrollment.studentId
      );
    })
    .map((e) => {
      return {
        session_id: Number(e.sessionId),
        enrollment_status: e.status.toUpperCase(),
        rejection_reason: e.reason,
        created_at: e.createdAt,
        updated_at: e.updatedAt,
      } as Pick<
        EnrollmentType,
        | 'session_id'
        | 'enrollment_status'
        | 'rejection_reason'
        | 'created_at'
        | 'updated_at'
      >;
    });

  const hasPendingEnrollment = sameStudentCourseEnrollements.some(
    (e) => e.enrollment_status === 'PENDING',
  );

  return {
    course_id: String(enrollment.courseId),
    course_title: enrollment.courseName,
    course_desc: enrollment.courseDescription,
    course_code: enrollment.courseCode,
    course_credits: Number(enrollment.courseCredit),
    course_type: enrollment.courseType,
    created_at: new Date(enrollment.createdAt),
    updated_at: new Date(enrollment.updatedAt),
    in_active_session: enrollment.isActiveSession,
    is_enrolled: enrollment.status === 'approved',
    can_enroll:
      enrollment.isActiveSession &&
      !hasPendingEnrollment &&
      enrollment.courseStatus.toLowerCase() === 'open',
    can_request:
      enrollment.isActiveSession &&
      !hasPendingEnrollment &&
      enrollment.courseStatus.toLowerCase() !== 'open',
    student_course_enrollements: sameStudentCourseEnrollements,
    active_session_ids: activeSessionIds,
    total_programs: 0,
    availability_status: enrollment.courseStatus.toUpperCase(),
  } as StudentCourseListType;
};
