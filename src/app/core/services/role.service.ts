import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../../shared/models/role';

export interface RoleDetailsDto {
  id: number;
  roleName: string;
  permissionIds: number[];
  usernames: string[];
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/roles';

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getPermissionMatrix() {
    return this.http.get<any>('http://localhost:8080/api/permissions/matrix');
  }

  createRole(payload: { roleName: string; permissionIds: number[] }) {
    return this.http.post('http://localhost:8080/api/roles', payload);
  }

  delete(id: number) {
    return this.http.delete(`http://localhost:8080/api/roles/${id}`);
  }

  getById(id: number) {
    return this.http.get<{
      id: number;
      roleName: string;
      permissionIds: number[];
      usernames: string[];
    }>(`http://localhost:8080/api/roles/${id}`);
  }

  patchRole(id: number, payload: {
    roleName?: string;
    addUsers?: string[];
    removeUsers?: string[];
    addPermissionIds?: number[];
    removePermissionIds?: number[];
  }) {
    return this.http.patch(`http://localhost:8080/api/roles/${id}`, payload);
  }


}
