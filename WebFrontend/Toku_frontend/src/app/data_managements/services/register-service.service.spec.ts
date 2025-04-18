import { TestBed } from '@angular/core/testing';

import { RegisterServiceService } from './register-service.service';

describe('RegisterServiceService', () => {
  let service: RegisterServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisterServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
