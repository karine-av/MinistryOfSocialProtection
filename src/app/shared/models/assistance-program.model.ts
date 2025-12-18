export interface AssistanceProgram {
  program_id: number;
  program_name: string;
  is_active: boolean;
  min_age?: number;
  max_age?: number;
  max_income_threshold?: number;

  createdAt?: string;
  updatedAt?: string;
}
