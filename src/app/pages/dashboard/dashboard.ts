import { Component, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { SidenavService} from '../../common/side-nav/sidenav.service';
import { Subscription } from 'rxjs';
import { LocaleService } from '../../core/services/locale.service';
import { TranslationService } from '../../core/services/translation.service';
import { FormsModule } from '@angular/forms';
import { SideNavComponent } from '../../common/side-nav/side-nav.component';
import { HeaderComponent } from '../../common/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    FormsModule,
    SideNavComponent,
    HeaderComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements AfterViewInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;
  private sidenavService = inject(SidenavService);
  private localeService = inject(LocaleService);
  private translationService = inject(TranslationService);
  private subscription?: Subscription;

  selectedLocale = this.localeService.getLocale();
  supportedLocales = this.localeService.supportedLocales;

  ngAfterViewInit() {
    this.subscription = this.sidenavService.closeSidenav$.subscribe(() => {
      if (this.drawer && this.drawer.opened) {
        this.drawer.close();
      }
    });
  }

  onLocaleChange(locale: string) {
    this.localeService.setLocale(locale);
    this.translationService.setLocale(locale);
    this.selectedLocale = locale;
    window.location.reload();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
