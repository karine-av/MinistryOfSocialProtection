import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class SetPasswordService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/users'; // base URL

  setPassword(userId: number, password: string): Observable<User> {
    const payload = { password };
    return this.http.put<User>(`${this.apiUrl}/${userId}`, payload);
  }
}
