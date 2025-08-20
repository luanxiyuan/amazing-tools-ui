import { TestBed } from '@angular/core/testing';

import { StringToolService } from './string-tool.service';

describe('StringToolService', () => {
  let service: StringToolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StringToolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
