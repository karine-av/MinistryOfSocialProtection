import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { BeneficiariesByCityDto } from '../models/metrics.model';
import {TranslatePipe} from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-export-csv-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, TranslatePipe],
  templateUrl: './export-csv-button.component.html',
  styleUrls: ['./export-csv-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportCsvButtonComponent {
  @Input() data: BeneficiariesByCityDto | null = null;

  exportCsv(): void {
    if (!this.data || !this.data.items?.length) {
      return;
    }

    const header = 'city,beneficiaryCount';
    const rows = this.data.items.map(
      item => `${this.escape(item.city)},${item.beneficiaryCount}`
    );
    const csvContent = [header, ...rows].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'beneficiaries-by-city.csv';
    link.click();

    URL.revokeObjectURL(url);
  }

  private escape(value: string | null | undefined): string {
    if (value == null) return '';

    // Basic CSV escaping
    if (value.includes(',') || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
  }
}
