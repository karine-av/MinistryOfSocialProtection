import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LocaleService } from '../../core/services/locale.service';

@Pipe({
  name: 'localeDate',
  standalone: true
})
export class LocaleDatePipe implements PipeTransform {
  private localeService = inject(LocaleService);

  transform(value: string | Date | null | undefined, format?: string): string | null {
    if (!value) {
      return null;
    }

    const dateFormat = format || this.localeService.getDateFormat();
    const date = typeof value === 'string' ? new Date(value) : value;
    const locale = this.localeService.getLocaleForAngular();
    const datePipe = new DatePipe(locale);

    return datePipe.transform(date, dateFormat);
  }
}

