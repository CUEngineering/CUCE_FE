import type { EnrollmentType } from './enrollment';

export interface CourseType {
  course_id: string;
  course_title: string;
  course_desc: string;
  course_code: string;
  course_credits: number;
  course_type: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface StudentCourseListType extends CourseType {
  in_active_session: boolean;
  is_enrolled: boolean;
  is_student_in_session: boolean;
  is_student_in_active_session: boolean;
  can_enroll: boolean;
  can_request: boolean;
  enrollment_deadline?: string | Date;
  student_course_enrollements: Pick<
    EnrollmentType,
    | 'session_id'
    | 'enrollment_status'
    | 'rejection_reason'
    | 'created_at'
    | 'updated_at'
  >[];
  active_session_ids: string[];
  total_programs: number;
  availability_status: 'OPEN' | 'CLOSED' | 'FULL' | 'CANCELLED';
}
