import { TestBed } from '@angular/core/testing';

import { ActiveGroupMenuServiceService } from './active-group-menu-service.service';

describe('ActiveGroupMenuServiceService', () => {
  let service: ActiveGroupMenuServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveGroupMenuServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
