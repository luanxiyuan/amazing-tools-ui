import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XsdConverterComponent } from './xsd-converter.component';

describe('XsdConverterComponent', () => {
  let component: XsdConverterComponent;
  let fixture: ComponentFixture<XsdConverterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [XsdConverterComponent]
    });
    fixture = TestBed.createComponent(XsdConverterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
