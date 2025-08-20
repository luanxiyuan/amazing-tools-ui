import { TestBed } from '@angular/core/testing';

import { UrlToolService } from './url-tool.service';

describe('UrlToolService', () => {
  let service: UrlToolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlToolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
