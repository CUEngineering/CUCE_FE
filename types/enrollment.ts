export interface EnrollmentType {
  enrollment_id: number;
  enrollment_status:
    | 'ACTIVE'
    | 'COMPLETED'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'PENDING';
  student_id: number;
  registrar_id?: number | null;
  rejection_reason: string;
  admin_id?: number | null;
  course_id: number;
  session_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface EnrollmentListType {
  enrollmentId: number;
  studentName: string;
  studentId: string;
  studentImage: string;
  courseCode: string;
  courseCredit: string;
  courseName: string;
  courseType: 'UNDERGRADUATE' | 'GRADUATE' | 'MASTERS' | 'DOCTORATE';
  courseDescription: string;
  sessionId: string | number;
  isActiveSession: boolean;
  enrollmentDeadline: string | Date;
  isStudentInSession: boolean;
  courseId: string | number;
  courseStatus: string;
  program: string;
  status: 'approved' | 'pending' | 'rejected';
  assignedRegistrar: string;
  assignedRegistrarImage: string;
  assignedStatus: 'unassigned' | 'toOthers' | 'toMe';
  sessionName: string;
  reason?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
