import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitListComponent } from './commit-list.component';

describe('CommitListComponent', () => {
  let component: CommitListComponent;
  let fixture: ComponentFixture<CommitListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommitListComponent]
    });
    fixture = TestBed.createComponent(CommitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
