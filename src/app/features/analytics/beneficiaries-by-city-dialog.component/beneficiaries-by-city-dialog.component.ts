import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { BeneficiariesByCityDto } from '../models/metrics.model';
import { ExportCsvButtonComponent } from '../export-csv-button.component/export-csv-button.component';
import {TranslatePipe} from '../../../shared/pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-beneficiaries-by-city-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    BaseChartDirective,
    ExportCsvButtonComponent,
    TranslatePipe
  ],
  templateUrl: './beneficiaries-by-city-dialog.component.html',
  styleUrls: ['./beneficiaries-by-city-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BeneficiariesByCityDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    readonly data: BeneficiariesByCityDto,
    private readonly dialogRef: MatDialogRef<BeneficiariesByCityDialogComponent>
  ) {}

  /** FULL dataset */
  readonly chartData = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: this.data.items.map(i => i.city ?? 'Unknown'),
    datasets: [
      {
        data: this.data.items.map(i => i.beneficiaryCount),
        label: 'Beneficiaries',
        barThickness: 18,          // 👈 prevents “hairline bars”
        maxBarThickness: 24
      }
    ]
  }));

  /** FIXED options for dense data */
  readonly chartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',               // 👈 HORIZONTAL bars (CRITICAL)
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0             // 👈 prevents weird decimals / single 0
        }
      },
      y: {
        ticks: {
          autoSkip: false          // 👈 SHOW ALL CITY NAMES
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  /** Dynamic height so bars never overlap */
  readonly chartHeightPx = computed(() =>
    Math.max(300, this.data.items.length * 32)
  );

  close(): void {
    this.dialogRef.close();
  }
}
