import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

interface LoginResponse {
  token: string;
  isFirstLogin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'jwt';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; otp: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/login', credentials)
      .pipe(
        tap(res => this.saveToken(res.token))
      );
  }

  setPassword(data: { password: string }): Observable<any> {
    return this.http.post('/set-password', data);
  }


  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }


  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
