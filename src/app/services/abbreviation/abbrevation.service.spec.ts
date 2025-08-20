import { TestBed } from '@angular/core/testing';

import { AbbrevationService } from './abbrevation.service';

describe('AbbrevationService', () => {
  let service: AbbrevationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AbbrevationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
