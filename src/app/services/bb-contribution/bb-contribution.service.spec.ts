import { TestBed } from '@angular/core/testing';

import { BbContributionService } from './bb-contribution.service';

describe('BbContributionService', () => {
  let service: BbContributionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BbContributionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
