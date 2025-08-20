import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneStepComponent } from './one-step.component';

describe('OneStepComponent', () => {
  let component: OneStepComponent;
  let fixture: ComponentFixture<OneStepComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OneStepComponent]
    });
    fixture = TestBed.createComponent(OneStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
