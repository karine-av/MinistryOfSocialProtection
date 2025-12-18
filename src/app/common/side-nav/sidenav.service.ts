import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidenavService {
  private closeSidenavSubject = new Subject<void>();
  public closeSidenav$ = this.closeSidenavSubject.asObservable();

  close(): void {
    this.closeSidenavSubject.next();
  }
}

