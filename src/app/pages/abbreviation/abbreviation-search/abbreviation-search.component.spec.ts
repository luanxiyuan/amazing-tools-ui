import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbbreviationSearchComponent } from './abbreviation-search.component';

describe('AbbreviationSearchComponent', () => {
  let component: AbbreviationSearchComponent;
  let fixture: ComponentFixture<AbbreviationSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbbreviationSearchComponent]
    });
    fixture = TestBed.createComponent(AbbreviationSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
