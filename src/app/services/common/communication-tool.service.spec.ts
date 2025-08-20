import { TestBed } from '@angular/core/testing';

import { CommunicationToolService } from './communication-tool.service';

describe('CommunicationToolService', () => {
  let service: CommunicationToolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommunicationToolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
