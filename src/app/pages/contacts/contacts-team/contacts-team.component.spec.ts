import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsTeamComponent } from './contacts-team.component';

describe('ContactsTeamComponent', () => {
  let component: ContactsTeamComponent;
  let fixture: ComponentFixture<ContactsTeamComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContactsTeamComponent]
    });
    fixture = TestBed.createComponent(ContactsTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
