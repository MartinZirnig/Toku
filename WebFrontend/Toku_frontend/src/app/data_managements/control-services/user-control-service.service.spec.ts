import { TestBed } from '@angular/core/testing';

import { UserControlServiceService } from './user-control-service.service';

describe('UserControlServiceService', () => {
  let service: UserControlServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserControlServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
