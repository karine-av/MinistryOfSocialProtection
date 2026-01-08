import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private tokenKey = 'jwt';
  private cachedPayload: any | null = null;
  public hideDebugLogs = false;

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private decodePayload(): any {
    if (this.cachedPayload) {
      return this.cachedPayload;
    }

    try {
      const t = this.token;
      if (!t) {
        this.debug('No JWT token found.');
        return null;
      }

      const payloadBase64 = t.split('.')[1];
      if (!payloadBase64) {
        this.debug('Malformed JWT token.');
        return null;
      }

      const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(decodedJson);

      this.cachedPayload = payload;
      this.debug('Decoded JWT payload:', payload);
      return payload;

    } catch (err) {
      this.debug('Failed to decode JWT payload:', err);
      return null;
    }
  }

  has(permission: string): boolean {
    const payload = this.decodePayload();
    if (!payload) return false;

    const perms: string[] = payload.authorities || [];

    const result = perms.includes(permission);
    this.debug(`Checking permission "${permission}":`, result);
    return result;
  }

  get username(): string | null {
    const payload = this.decodePayload();
    const user = payload?.sub ?? null;
    this.debug('Username from JWT:', user);
    // console.log('Username from JWT:', user);
    return user;
  }

  private debug(...args: any[]) {
    if (!this.hideDebugLogs) console.log('[PermissionService]', ...args);
  }
}
