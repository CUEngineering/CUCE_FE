export interface SessionFilterType {
  session_id: number;
  session_name: string;
  start_date: string | Date;
  end_date: string | Date;
  enrollment_deadline: string | Date;
  session_status: 'ACTIVE' | 'CLOSED';
  created_at: string | Date;
  updated_at: string | Date;
}
