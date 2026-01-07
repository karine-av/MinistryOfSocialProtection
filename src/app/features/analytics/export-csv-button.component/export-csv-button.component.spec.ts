import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportCsvButtonComponent } from './export-csv-button.component';

describe('ExportCsvButtonComponent', () => {
  let component: ExportCsvButtonComponent;
  let fixture: ComponentFixture<ExportCsvButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportCsvButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportCsvButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
