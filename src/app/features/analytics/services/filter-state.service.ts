import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DashboardFilter} from '../models/metrics.model';

@Injectable({
  providedIn: 'root'
})
export class FilterStateService {
  private readonly initialFilter: DashboardFilter = {
    from: null,
    to: null,
    programId: null
  };


  private readonly filterSubject =
    new BehaviorSubject<DashboardFilter>(this.initialFilter);

  readonly filter$ = this.filterSubject.asObservable();

  updateFilter(patch: Partial<DashboardFilter>): void {
    const current = this.filterSubject.getValue();
    this.filterSubject.next({ ...current, ...patch });
  }

  reset(): void {
    this.filterSubject.next(this.initialFilter);
  }


  emitInitial(): void {
    this.filterSubject.next(this.filterSubject.getValue());
  }
}
