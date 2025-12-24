import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocaleSelectorService {
  private readonly STORAGE_KEY = 'appLocale';

  private localeSubject = new BehaviorSubject<string>(
    localStorage.getItem(this.STORAGE_KEY) ?? 'en'
  );

  locale$ = this.localeSubject.asObservable();

  get currentLocale(): string {
    return this.localeSubject.value;
  }

  setLocale(locale: string): void {
    localStorage.setItem(this.STORAGE_KEY, locale);
    this.localeSubject.next(locale);
  }
}
