import { Injectable, signal } from '@angular/core';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private translations: Map<string, TranslationDictionary> = new Map();
  private currentLocale = signal<string>('en');
  private translationsLoaded = signal(false);
  public readonly translationsLoaded$ = this.translationsLoaded.asReadonly();


  public readonly currentLocale$ = this.currentLocale.asReadonly();

  constructor() {
    this.loadTranslations();
  }

  private async loadTranslations() {
    try {
      // Load English (default)
      const enResponse = await fetch('/i18n/en.json');
      const en = await enResponse.json();
      this.translations.set('en', en);

      // Load Spanish
      try {
        const esResponse = await fetch('/i18n/es.json');
        const es = await esResponse.json();
        this.translations.set('es', es);
      } catch (e) {
        console.warn('Spanish translations not loaded');
      }

      // Load French
      try {
        const frResponse = await fetch('/i18n/fr.json');
        const fr = await frResponse.json();
        this.translations.set('fr', fr);
      } catch (e) {
        console.warn('French translations not loaded');
      }
      // Load Russian
      try {
        const ruResponse = await fetch('/i18n/ru.json');
        const ru = await ruResponse.json();
        this.translations.set('ru', ru);
      } catch (e) {
        console.warn('Russian translations not loaded');
      }

      // Load Armenian
      try {
        const hyResponse = await fetch('/i18n/hy.json');
        const hy = await hyResponse.json();
        this.translations.set('hy', hy);
      } catch (e) {
        console.warn('Armenian translations not loaded');
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
    }  finally {
      this.translationsLoaded.set(true);
    }
  }

  setLocale(locale: string) {
    const langCode = locale.split('-')[0];
    this.currentLocale.set(langCode);
    localStorage.setItem('appLocale', locale);
    localStorage.setItem('translationLocale', langCode);
    document.documentElement.lang = langCode;
  }

  getLocale(): string {
    const saved = localStorage.getItem('translationLocale');
    if (saved && this.translations.has(saved)) {
      return saved;
    }
    return this.currentLocale();
  }

  translate(key: string, params?: { [key: string]: string | number }): string {
    const locale = this.getLocale();
    const translations = this.translations.get(locale) || this.translations.get('en') || {};

    let value = this.getNestedValue(translations, key);

    if (!value && locale !== 'en') {
      // Fallback to English
      const enTranslations = this.translations.get('en') || {};
      value = this.getNestedValue(enTranslations, key);
    }

    if (!value) {
      return key;
    }

    // Replace parameters
    if (params) {
      Object.keys(params).forEach(paramKey => {
        value = value.replace(`{{${paramKey}}}`, String(params[paramKey]));
      });
    }

    return value;
  }

  private getNestedValue(obj: any, path: string): string {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  }
}

