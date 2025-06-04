import { TestBed } from '@angular/core/testing';

import { AiServiceService } from './ai-service.service';

describe('AiServiceService', () => {
  let service: AiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
