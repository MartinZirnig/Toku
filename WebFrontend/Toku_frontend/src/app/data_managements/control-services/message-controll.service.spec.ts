import { TestBed } from '@angular/core/testing';

import { MessageControllService } from './message-controll.service';

describe('MessageControllService', () => {
  let service: MessageControllService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageControllService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
