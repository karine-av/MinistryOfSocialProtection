import { Component, EventEmitter, Output } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-header-dropdown',
  standalone: true,
  imports: [MatMenuModule, MatIconModule, TranslatePipe],
  templateUrl: './header-dropdown.component.html',
  styleUrls: ['./header-dropdown.component.scss']
})
export class HeaderDropdownComponent {
  @Output() logoutClick = new EventEmitter<void>();

  onLogout() {
    this.logoutClick.emit();
  }
}
