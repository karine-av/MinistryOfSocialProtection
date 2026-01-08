export interface CitizenRequest {
  full_name: string;
  national_id: string;
  date_of_birth: string;
  address: string;
  annual_income: number;
  household_id: number | null;
}
