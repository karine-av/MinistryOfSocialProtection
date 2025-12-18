import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslatePipe} from '../../shared/pipes/translate.pipe';

export interface HeaderLocaleOption {
  code: string;
  name: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    TranslatePipe,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  @Input({ required: true }) selectedLocale!: string;
  @Input({ required: true }) supportedLocales!: HeaderLocaleOption[];

  @Output() selectedLocaleChange = new EventEmitter<string>();
  @Output() toggleSidenav = new EventEmitter<void>();

  onLocaleChange(locale: string) {
    this.selectedLocaleChange.emit(locale);
  }

  onToggleSidenav() {
    this.toggleSidenav.emit();
  }
}


