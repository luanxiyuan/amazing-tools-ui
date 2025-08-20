import { TestBed } from '@angular/core/testing';

import { CanvasToolService } from './canvas-tool.service';

describe('CanvasToolService', () => {
  let service: CanvasToolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasToolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
