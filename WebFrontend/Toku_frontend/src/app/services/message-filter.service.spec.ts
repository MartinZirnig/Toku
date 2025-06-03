import { TestBed } from '@angular/core/testing';

import { MessageFilterService } from './message-filter.service';

describe('MessageFilterService', () => {
  let service: MessageFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
