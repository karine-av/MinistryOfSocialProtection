export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEW' | 'APPROVED' | 'REJECTED';

export interface Application {
  application_id: number;
  citizen_id: number;
  program_id: number;
  status: ApplicationStatus;
  submission_date: string;

  createdAt?: string;
  updatedAt?: string;
}
