import { Component } from '@angular/core';
import { LocaleSelectorService } from '../locale-selector/locale-selector.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  selectedLocale = '';
  supportedLocales = [
    { code: 'en', name: 'English' },
    { code: 'hy', name: 'Հայերեն' },
    { code: 'ru', name: 'Русский' }
  ];

  constructor(
    private localeService: LocaleSelectorService,
    private router: Router
  ) {
    this.localeService.locale$.subscribe(locale => {
      this.selectedLocale = locale;
    });
  }

  onLocaleChange(locale: string) {
    this.localeService.setLocale(locale);
  }

  onLogout() {
    this.router.navigate(['/login']);
  }
}
