import { TestBed } from '@angular/core/testing';

import { FileToolService } from './file-tool.service';

describe('FileToolService', () => {
  let service: FileToolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileToolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
