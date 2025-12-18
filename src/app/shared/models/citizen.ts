export interface Citizen {
  citizen_id: number;
  full_name: string;
  national_id: string;
  date_of_birth: string;
  address: string;
  annual_income: number;

  createdAt?: string;
  updatedAt?: string;
}
