import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe} from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, TranslatePipe],
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent {
  securityOpen = true;

  toggleSecurity() {
    this.securityOpen = !this.securityOpen;
  }

}


