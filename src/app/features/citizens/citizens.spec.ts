import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Citizens } from './citizens';

describe('Citizens', () => {
  let component: Citizens;
  let fixture: ComponentFixture<Citizens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Citizens]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Citizens);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
