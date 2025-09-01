export type RegistrarType = {
  created_at: Date;
  updated_at: Date;
  email: string;
  registrar_id: number;
  first_name: string | null;
  last_name: string | null;
  profile_picture: string | null;
  user_id: string;
  is_suspended: boolean;
  is_deactivated: boolean;
};
