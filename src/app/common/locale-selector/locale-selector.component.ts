import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface LocaleOption {
  code: string;
  name: string;
}

@Component({
  selector: 'app-locale-selector',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './locale-selector.component.html',
  styleUrls: ['./locale-selector.component.scss']
})
export class LocaleSelectorComponent {
  @Input() selectedLocale!: string;
  @Input() supportedLocales: LocaleOption[] = [];

  @Output() selectedLocaleChange = new EventEmitter<string>();

  getLanguageName(code: string): string {
    const locale = this.supportedLocales.find(l => l.code === code);
    return locale ? locale.name : code;
  }

  changeLocale(code: string) {
    this.selectedLocaleChange.emit(code);
  }
}
