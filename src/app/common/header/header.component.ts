import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService} from '../../core/services/auth.service';

import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { HeaderDropdownComponent } from '../header-dropdown/header-dropdown.component';
import { LocaleSelectorComponent } from '../locale-selector/locale-selector.component';

export interface HeaderLocaleOption {
  code: string;
  name: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    TranslatePipe,
    HeaderDropdownComponent,
    LocaleSelectorComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input({ required: true }) selectedLocale!: string;
  @Input({ required: true }) supportedLocales!: HeaderLocaleOption[];

  @Output() selectedLocaleChange = new EventEmitter<string>();
  @Output() toggleSidenav = new EventEmitter<void>();

  constructor(private router: Router, private authService: AuthService) {}

  onLocaleChange(locale: string) {
    this.selectedLocaleChange.emit(locale);
  }

  onToggleSidenav() {
    this.toggleSidenav.emit();
  }

  onLogout() {
    this.authService.logout();

    this.router.navigate(['/login']);
  }
}
