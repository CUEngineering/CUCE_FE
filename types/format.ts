// types/registrar.ts
export interface RegistrarStats {
  totalSessions: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  cancelledEnrollments: number;
  approvedEnrollments: number;
  rejectedEnrollments: number;
}

export interface Registrar {
  registrar_id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_suspended: boolean;
  is_deactivated: boolean;
  stats?: RegistrarStats;
}

export interface FormattedProgram {
  id: number;
  name: string;
  enrolledStudents: number;
  courses: number;
  coreCount: number;
  type: string;
  credits: number;
}

export interface FormattedRegistrar {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: string;
  enrollRequests: number;
  approvals: number;
  denials: number;
}

// types/invitee.ts
export interface Invitee {
  invitation_id: number;
  email: string;
  token: string;
  expires_at: string;
  status: string;
  user_type: string;
  student_id: number | null;
  registrar_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface FormattedInvitee {
  id: number;
  email: string;
  date: string;
}
