import { TestBed } from '@angular/core/testing';

import { OneStepService } from './one-step.service';

describe('OneStepService', () => {
  let service: OneStepService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OneStepService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
