import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  effect,
  inject, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, startWith } from 'rxjs';
import { MetricsApiService } from '../services/metrics-api.service';
import { FilterStateService } from '../services/filter-state.service';
import { ApplicationFunnelDto } from '../models/metrics.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-application-funnel-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, BaseChartDirective, TranslatePipe ],
  templateUrl: './application-funnel-chart.component.html',
  styleUrls: ['./application-funnel-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationFunnelChartComponent {
  private readonly metricsApi = inject(MetricsApiService);
  private readonly filterState = inject(FilterStateService);

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private readonly data$ = this.filterState.filter$.pipe(
    switchMap(filter =>
      this.metricsApi.getApplicationFunnel(filter)
    ),
    startWith(null)
  );

  readonly data = toSignal<ApplicationFunnelDto | null>(this.data$, {
    initialValue: null
  });

  readonly loading = computed(() => this.data() === null);

  readonly chartData = computed<ChartConfiguration<'pie'>['data']>(() => {
    const dto = this.data();
    if (!dto) {
      return { labels: [], datasets: [] };
    }

    return {
      labels: dto.items.map(i => i.status),
      datasets: [{ data: dto.items.map(i => i.count) }]
    };
  });

  readonly chartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };

  constructor() {
    effect(() => {
      this.chartData();
      queueMicrotask(() => this.chart?.update());
    });
  }
}
