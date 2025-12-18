import { Injectable, signal } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import localeFr from '@angular/common/locales/fr';
import localeRu from '@angular/common/locales/ru';
import localeHy from '@angular/common/locales/hy';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private currentLocale = signal<string>('en-US');

  public readonly currentLocale$ = this.currentLocale.asReadonly();

  public readonly supportedLocales = [
    { code: 'en-US', name: 'English (US)', dateFormat: 'MM/dd/yyyy', currency: 'USD' },
    { code: 'es-ES', name: 'Español', dateFormat: 'dd/MM/yyyy', currency: 'EUR' },
    { code: 'fr-FR', name: 'Français', dateFormat: 'dd/MM/yyyy', currency: 'EUR' },
    { code: 'ru-RU', name: 'Русский', dateFormat: 'dd.MM.yyyy', currency: 'RUB' },
    { code: 'hy-AM', name: 'Հայերեն', dateFormat: 'dd.MM.yyyy', currency: 'AMD' },
  ];

  constructor() {
    // Register locale data
    registerLocaleData(localeEn);
    registerLocaleData(localeEs);
    registerLocaleData(localeFr);
    registerLocaleData(localeRu);
    registerLocaleData(localeHy);

    // Load saved locale or default
    const saved = localStorage.getItem('appLocale') || 'en-US';
    this.setLocale(saved);
  }

  setLocale(locale: string) {
    this.currentLocale.set(locale);
    localStorage.setItem('appLocale', locale);
    document.documentElement.lang = locale.split('-')[0];
  }

  getLocale(): string {
    return this.currentLocale();
  }

  getDateFormat(): string {
    const locale = this.getLocale();
    const localeConfig = this.supportedLocales.find(l => l.code === locale);
    return localeConfig?.dateFormat || 'MM/dd/yyyy';
  }

  getCurrencyCode(): string {
    const locale = this.getLocale();
    const localeConfig = this.supportedLocales.find(l => l.code === locale);
    return localeConfig?.currency || 'USD';
  }

  getLocaleForAngular(): string {
    return this.getLocale().toLowerCase().replace('-', '_');
  }
}

