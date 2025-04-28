import { TestBed } from '@angular/core/testing';

import { GoogleAuthenticationService } from './google-authentication-service.service';

describe('GoogleAuthenticationServiceService', () => {
  let service: GoogleAuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleAuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
