export interface ProgramOutput {
  id: number;
  name: string;
  type: string;
  credits: number;
  courses?: number;
  // enrolledStudents?: number;
}

export enum ProgramTypeEnum {
  UNDERGRADUATE = 'UNDERGRADUATE',
  GRADUATE = 'GRADUATE',
  MASTERS = 'MASTERS',
  DOCTORATE = 'DOCTORATE',
}

export type ProgramType = {
  program_id: number;
  program_name: string;
  program_type: ProgramTypeEnum;
  total_credits: number;
  created_at: Date;
  updated_at: Date;
};
