import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationFunnelChart } from './application-funnel-chart';

describe('ApplicationFunnelChart', () => {
  let component: ApplicationFunnelChart;
  let fixture: ComponentFixture<ApplicationFunnelChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationFunnelChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationFunnelChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
