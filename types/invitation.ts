import type { UserTypeEnum } from './user';

export enum InvitationStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export type InvitationType = {
  created_at: Date;
  updated_at: Date;
  invitation_id: number;
  email: string;
  token: string;
  expires_at: Date;
  status: InvitationStatusEnum;
  user_type: UserTypeEnum;
  student_id: number | null;
  registrar_id: number | null;
};
