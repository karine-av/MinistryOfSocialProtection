import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialLiabilityDialogComponent } from './financial-liability-dialog.component';

describe('FinancialLiabilityDialogComponent', () => {
  let component: FinancialLiabilityDialogComponent;
  let fixture: ComponentFixture<FinancialLiabilityDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialLiabilityDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialLiabilityDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
