import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../../shared/models/role';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080//roles';

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

}
