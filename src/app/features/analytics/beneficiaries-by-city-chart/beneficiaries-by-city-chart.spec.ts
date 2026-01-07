import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiariesByCityChart } from './beneficiaries-by-city-chart';

describe('BeneficiariesByCityChart', () => {
  let component: BeneficiariesByCityChart;
  let fixture: ComponentFixture<BeneficiariesByCityChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiariesByCityChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeneficiariesByCityChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
