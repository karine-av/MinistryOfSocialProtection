// src/app/features/dashboard/models/metrics.models.ts

export interface ApplicationFunnelItem {
  status: 'SUBMITTED' | 'REVIEW' | 'APPROVED' | 'REJECTED';
  count: number;
  /**
   * Percentage in the range 0–100 (as per our decision).
   */
  percentage: number;
}

export interface ApplicationFunnelDto {
  total: number;
  items: ApplicationFunnelItem[];
}

export interface BeneficiariesByCityItem {
  city: string;
  beneficiaryCount: number;
}

export interface BeneficiariesByCityDto {
  items: BeneficiariesByCityItem[];
}


export interface FinancialLiabilityDto {
  totalLiability: number;
  byProgram: ProgramLiability[];
}

export interface ProgramDto {
  programId: number;
  programName: string;
}

export interface ProgramLiability {
  programId: number;
  programName: string;
  approvedCount: number;
  payoutAmount: number;
  projectedLiability: number;
}



export interface DashboardFilter {
  from: Date | null;
  to: Date | null;
  programId: number | null;
}
