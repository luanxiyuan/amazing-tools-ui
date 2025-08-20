import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BbContributionComponent } from './bb-contribution.component';

describe('BbContributionComponent', () => {
  let component: BbContributionComponent;
  let fixture: ComponentFixture<BbContributionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BbContributionComponent]
    });
    fixture = TestBed.createComponent(BbContributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
