import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardFiltersComponent } from '../dashboard-filters/dashboard-filters.component';
import { ApplicationFunnelChartComponent } from '../application-funnel-chart/application-funnel-chart.component';
import { BeneficiariesByCityChartComponent } from '../beneficiaries-by-city-chart/beneficiaries-by-city-chart.component';
import {FinancialLiabilityChartComponent} from '../financial-liability-chart/financial-liability-chart.component';
import { FilterStateService } from '../services/filter-state.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardFiltersComponent,
    ApplicationFunnelChartComponent,
    BeneficiariesByCityChartComponent,
    FinancialLiabilityChartComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent implements OnInit {
  private readonly filterState = inject(FilterStateService);

  ngOnInit(): void {
    this.filterState.emitInitial();
  }
}
