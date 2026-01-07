import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/users';

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

}
