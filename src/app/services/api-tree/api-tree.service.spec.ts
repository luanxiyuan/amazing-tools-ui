import { TestBed } from '@angular/core/testing';

import { ApiTreeService } from './api-tree.service';

describe('ApiTreeService', () => {
  let service: ApiTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
