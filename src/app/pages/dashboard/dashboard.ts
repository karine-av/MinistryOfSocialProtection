import { Component, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { SidenavService } from '../../common/side-nav/sidenav.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;
  private sidenavService = inject(SidenavService);
  private subscription?: Subscription;

  ngAfterViewInit() {
    this.subscription = this.sidenavService.closeSidenav$.subscribe(() => {
      if (this.drawer && this.drawer.opened) {
        this.drawer.close();
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
