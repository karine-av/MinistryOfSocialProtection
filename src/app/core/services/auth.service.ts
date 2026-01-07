import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  username: string;
  permissions: string[];
  isFirstLogin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'jwt';
  private readonly FIRST_LOGIN_KEY = 'isFirstLogin';
  private readonly PERMISSIONS_KEY = 'permissions';
  private readonly USERNAME_KEY = 'username';

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/login', credentials).pipe(
      tap(res => {
        this.saveToken(res.token);
        this.saveFirstLogin(res.isFirstLogin);
        this.savePermissions(res.permissions);
        this.saveUsername(res.username);
      })
    );
  }

  setPassword(data: { password: string }): Observable<void> {
    return this.http.post<void>('/set-password', data).pipe(
      tap(() => {
        this.clearFirstLogin();
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.FIRST_LOGIN_KEY);
    localStorage.removeItem(this.PERMISSIONS_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private saveFirstLogin(value: boolean): void {
    localStorage.setItem(this.FIRST_LOGIN_KEY, String(value));
  }

  isFirstLogin(): boolean {
    return localStorage.getItem(this.FIRST_LOGIN_KEY) === 'true';
  }

  clearFirstLogin(): void {
    localStorage.removeItem(this.FIRST_LOGIN_KEY);
  }

  private savePermissions(permissions: string[]): void {
    localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(permissions));
  }

  getPermissions(): string[] {
    const stored = localStorage.getItem(this.PERMISSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }

  private saveUsername(username: string): void {
    localStorage.setItem(this.USERNAME_KEY, username);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }
}
