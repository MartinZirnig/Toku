import { TestBed } from '@angular/core/testing';

import { GroupReloadService } from './group-reload.service';

describe('GroupReloadService', () => {
  let service: GroupReloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupReloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
