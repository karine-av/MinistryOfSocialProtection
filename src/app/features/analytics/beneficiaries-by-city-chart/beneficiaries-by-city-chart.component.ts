import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  effect,
  inject,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, startWith } from 'rxjs';

import { MetricsApiService } from '../services/metrics-api.service';
import { FilterStateService } from '../services/filter-state.service';
import { BeneficiariesByCityDto } from '../models/metrics.model';
import { ExportCsvButtonComponent } from '../export-csv-button.component/export-csv-button.component';
import {BeneficiariesByCityDialogComponent}
  from '../beneficiaries-by-city-dialog.component/beneficiaries-by-city-dialog.component';

@Component({
  selector: 'app-beneficiaries-by-city-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    BaseChartDirective,
    ExportCsvButtonComponent
  ],
  templateUrl: './beneficiaries-by-city-chart.component.html',
  styleUrls: ['./beneficiaries-by-city-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BeneficiariesByCityChartComponent {
  private readonly metricsApi = inject(MetricsApiService);
  private readonly filterState = inject(FilterStateService);
  private readonly dialog = inject(MatDialog);

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private readonly data$ = this.filterState.filter$.pipe(
    switchMap(filter =>
      this.metricsApi.getBeneficiariesByCity(filter)
    ),
    startWith(null)
  );

  readonly data = toSignal<BeneficiariesByCityDto | null>(this.data$, {
    initialValue: null
  });

  readonly loading = computed(() => this.data() === null);

  /** Full list (never mutated) */
  readonly allItems = computed(() => this.data()?.items ?? []);

  /** Chart shows only first 12 */
  readonly visibleItems = computed(() =>
    this.allItems().slice(0, 12)
  );

  readonly hasMoreCities = computed(() =>
    this.allItems().length > 12
  );

  readonly chartData = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: this.visibleItems().map(i => i.city ?? 'Unknown'),
    datasets: [
      {
        data: this.visibleItems().map(i => i.beneficiaryCount),
        label: 'Beneficiaries'
      }
    ]
  }));

  readonly chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: { y: { beginAtZero: true } }
  };

  openDialog(): void {
    const dto = this.data();
    if (!dto) return;

    this.dialog.open(BeneficiariesByCityDialogComponent, {
      width: '900px',
      maxHeight: '80vh',
      data: dto
    });
  }

  constructor() {
    effect(() => {
      this.chartData();
      queueMicrotask(() => this.chart?.update());
    });
  }
}
