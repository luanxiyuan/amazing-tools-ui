import { TestBed } from '@angular/core/testing';

import { JsonToolService } from './json-tool.service';

describe('JsonToolService', () => {
  let service: JsonToolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonToolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
