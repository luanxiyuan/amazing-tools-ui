import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsPersonComponent } from './contacts-person.component';

describe('ContactsPersonComponent', () => {
  let component: ContactsPersonComponent;
  let fixture: ComponentFixture<ContactsPersonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContactsPersonComponent]
    });
    fixture = TestBed.createComponent(ContactsPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
