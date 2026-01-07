import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialLiabilityChart } from './financial-liability-chart';

describe('FinancialLiabilityChart', () => {
  let component: FinancialLiabilityChart;
  let fixture: ComponentFixture<FinancialLiabilityChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialLiabilityChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialLiabilityChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
