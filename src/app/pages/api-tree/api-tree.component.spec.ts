import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiTreeComponent } from './api-tree.component';

describe('ApiTreeComponent', () => {
  let component: ApiTreeComponent;
  let fixture: ComponentFixture<ApiTreeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApiTreeComponent]
    });
    fixture = TestBed.createComponent(ApiTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
