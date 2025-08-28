import type { InvitationType } from './invitation';
import type { ProgramType } from './program';
import type { RegistrarType } from './registrar';

export type StudentType = {
  first_name: string | null;
  last_name: string | null;
  email: string;
  profile_picture: string | null;
  user_id: string | null;
  created_at: Date;
  updated_at: Date;
  student_id: number;
  reg_number: string;
  program_id: number;
  status: string;
};

export type StudentWithRegistrar = Pick<
  StudentType,
  | 'student_id'
  | 'reg_number'
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'profile_picture'
  | 'program_id'
  | 'status'
  | 'created_at'
  | 'updated_at'
> & {
  program: Pick<
    ProgramType,
    'program_id' | 'program_name' | 'program_type' | 'total_credits'
  >;
  invitation?: null | Pick<
    InvitationType,
    | 'invitation_id'
    | 'email'
    | 'expires_at'
    | 'status'
    | 'user_type'
    | 'created_at'
    | 'updated_at'
  >;
  registrar?: null | Pick<
    RegistrarType,
    | 'registrar_id'
    | 'first_name'
    | 'last_name'
    | 'email'
    | 'profile_picture'
    | 'is_deactivated'
    | 'is_suspended'
  >;
  can_claim: boolean;
};
