import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, of, map, tap, shareReplay } from 'rxjs';
import { User} from '../../shared/models/user';

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'jwt';
  private readonly apiBaseUrl = 'http://localhost:8080';

  private currentUser$: Observable<User> | null = null;

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/login`, credentials).pipe(
      tap(res => this.saveToken(res.token))
    );
  }

  logout(token: string): Observable<any> {
    localStorage.removeItem(this.TOKEN_KEY);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    })

    this.currentUser$ = null;
    console.log("call sent")
    return this.http.post<void>(`${this.apiBaseUrl}/api/logout`, {}, {headers, observe: 'response'});

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

  private decodePayload(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return null;
      const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedJson);
    } catch (err) {
      console.error('Failed to decode JWT payload', err);
      return null;
    }
  }

  getUsername(): string | null {
    const payload = this.decodePayload();
    return payload?.sub ?? null;
  }

  // getPermissions(): string[] {
  //   const payload = this.decodePayload();
  //   return payload?.authorities ?? [];
  // }

  // hasPermission(permission: string): boolean {
  //   return this.getPermissions().includes(permission);
  // }

  getCurrentUser(): Observable<User | null> {
    if (!this.getUsername()) return of(null);

    if (!this.currentUser$) {
      this.currentUser$ = this.http
        .get<User>(`${this.apiBaseUrl}/users/${this.getUsername()}`)
        .pipe(shareReplay(1));
    }
    return this.currentUser$;
  }

  getUserId(): Observable<number | null> {
    return this.getCurrentUser().pipe(
      map(user => user?.id ?? null)
    );
  }

  isFirstLogin(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => {
        if (!user) {
          return false;
        }
        if (user.updatedAt === null) {
          return true;
        } else {
          return false;
        }
      })
    );
  }
}
