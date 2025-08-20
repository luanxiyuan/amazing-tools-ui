import { TestBed } from '@angular/core/testing';

import { UiMarkerService } from './ui-marker.service';

describe('UiMarkerService', () => {
  let service: UiMarkerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiMarkerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
