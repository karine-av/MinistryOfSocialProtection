import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import {ProgramDto} from '../models/metrics.model';
import { FilterStateService } from '../services/filter-state.service';
import {ProgramsApiService} from '../services/program.service';

@Component({
  selector: 'app-dashboard-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './dashboard-filters.component.html',
  styleUrls: ['./dashboard-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardFiltersComponent implements OnInit {
  private readonly filterState = inject(FilterStateService);
  private readonly programsApi = inject(ProgramsApiService);

  from: Date | null = null;
  to: Date | null = null;
  programId: number | null = null;

  programs: ProgramDto[] = [];

  ngOnInit(): void {
    this.programsApi.getPrograms(true).subscribe(programs => {
      this.programs = programs;
    });
  }

  apply(): void {
    if (this.from && this.to && this.from > this.to) {
      const tmp = this.from;
      this.from = this.to;
      this.to = tmp;
    }

    this.filterState.updateFilter({
      from: this.from,
      to: this.to,
      programId: this.programId
    });
  }

  clear(): void {
    this.from = null;
    this.to = null;
    this.programId = null;
    this.filterState.reset();
  }
}
