import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsPersonEditComponent } from './contacts-person-edit.component';

describe('ContactsPersonEditComponent', () => {
  let component: ContactsPersonEditComponent;
  let fixture: ComponentFixture<ContactsPersonEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContactsPersonEditComponent]
    });
    fixture = TestBed.createComponent(ContactsPersonEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
