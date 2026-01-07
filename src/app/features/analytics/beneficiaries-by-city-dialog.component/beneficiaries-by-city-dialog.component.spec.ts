import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiariesByCityDialogComponent } from './beneficiaries-by-city-dialog.component';

describe('BeneficiariesByCityDialogComponent', () => {
  let component: BeneficiariesByCityDialogComponent;
  let fixture: ComponentFixture<BeneficiariesByCityDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiariesByCityDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeneficiariesByCityDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
