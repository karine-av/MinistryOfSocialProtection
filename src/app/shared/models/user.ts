import { Role } from './role';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  status: string;
  updatedAt: Date | null;
  roles: Role[];
}
