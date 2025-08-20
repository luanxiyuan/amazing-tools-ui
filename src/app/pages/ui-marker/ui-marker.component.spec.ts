import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiMarkerComponent } from './ui-marker.component';

describe('UiMarkerComponent', () => {
  let component: UiMarkerComponent;
  let fixture: ComponentFixture<UiMarkerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UiMarkerComponent]
    });
    fixture = TestBed.createComponent(UiMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
