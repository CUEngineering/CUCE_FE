export interface SessionType {
  session_id: number;
  session_name: string;
  start_date: string | Date;
  end_date: string | Date;
  enrollment_deadline: string | Date;
  session_status: 'ACTIVE' | 'CLOSED';
  created_at: string | Date;
  updated_at: string | Date;
}

export type SessionFilterType = SessionType;

export interface SessionCourseType {
  session_id: string | number;
  course_id: string | number;
  status: 'CLOSED' | 'OPEN' | 'FULL' | 'CANCELLED';
  adjusted_capacity: number;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface SessionStudentType {
  student_id: string | number;
  session_id: string | number;
}

export interface SessionDetailType extends SessionFilterType {
  session_courses: SessionCourseType[];
  session_students: SessionStudentType[];
}

export type StudentSessionType = Pick<
  SessionFilterType,
  | 'session_id'
  | 'session_name'
  | 'start_date'
  | 'end_date'
  | 'enrollment_deadline'
  | 'session_status'
>;
