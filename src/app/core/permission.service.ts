import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private tokenKey = 'jwt';
  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  // naive JWT decode (no verification) — backend must be the source of truth
  private decodePayload(): any {
    try {
      const t = this.token;
      if (!t) return null;
      const payload = t.split('.')[1];
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;
    }
  }
  has(permission: string): boolean {
    const payload = this.decodePayload();
    if (!payload) return false;
    const perms: string[] = payload.permissions || payload.scope || [];
    return perms.includes(permission);
  }
  get username(): string | null {
    const payload = this.decodePayload();
    return payload?.sub ?? null;
  }
}
