import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, startWith } from 'rxjs';

import { MetricsApiService } from '../services/metrics-api.service';
import { FilterStateService } from '../services/filter-state.service';
import { FinancialLiabilityDto } from '../models/metrics.model';
import { FinancialLiabilityDialogComponent } from
    '../financial-liability-dialog.component/financial-liability-dialog.component';

@Component({
  selector: 'app-financial-liability-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    MatButtonModule
  ],
  templateUrl: './financial-liability-chart.component.html',
  styleUrls: ['./financial-liability-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancialLiabilityChartComponent {
  private readonly metricsApi = inject(MetricsApiService);
  private readonly filterState = inject(FilterStateService);
  private readonly dialog = inject(MatDialog);

  private readonly data$ = this.filterState.filter$.pipe(
    switchMap(filter =>
      this.metricsApi.getFinancialLiability(filter)
    ),
    startWith(null)
  );

  readonly data = toSignal<FinancialLiabilityDto | null>(this.data$, {
    initialValue: null
  });

  readonly loading = computed(() => this.data() === null);

  readonly displayedColumns = [
    'programName',
    'approvedCount',
    'payoutAmount',
    'projectedLiability'
  ] as const;

  /** All rows */
  readonly allRows = computed(() => this.data()?.byProgram ?? []);

  /** Only first X rows */
  readonly visibleRows = computed(() =>
    this.allRows().slice(0, 3)
  );

  /** Whether "Show more" button should appear */
  readonly hasMoreRows = computed(() =>
    this.allRows().length > 3
  );

  openDialog(): void {
    this.dialog.open(FinancialLiabilityDialogComponent, {
      width: '900px',
      maxHeight: '80vh',
      data: {
        rows: this.allRows(),
        displayedColumns: this.displayedColumns
      }
    });
  }
}
