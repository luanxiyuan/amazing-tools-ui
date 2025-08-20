import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonToolComponent } from './json-tool.component';

describe('JsonToolComponent', () => {
  let component: JsonToolComponent;
  let fixture: ComponentFixture<JsonToolComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JsonToolComponent]
    });
    fixture = TestBed.createComponent(JsonToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
