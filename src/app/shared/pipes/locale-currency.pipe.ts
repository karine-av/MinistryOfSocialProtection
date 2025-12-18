import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { LocaleService } from '../../core/services/locale.service';

@Pipe({
  name: 'localeCurrency',
  standalone: true
})
export class LocaleCurrencyPipe implements PipeTransform {
  private localeService = inject(LocaleService);

  transform(value: number | null | undefined, currencyCode?: string): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const currency = currencyCode || this.localeService.getCurrencyCode();
    const locale = this.localeService.getLocaleForAngular();
    const currencyPipe = new CurrencyPipe(locale);

    return currencyPipe.transform(value, currency, 'symbol', '1.2-2');
  }
}

