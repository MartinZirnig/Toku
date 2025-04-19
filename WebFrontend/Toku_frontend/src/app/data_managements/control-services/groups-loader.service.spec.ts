import { TestBed } from '@angular/core/testing';

import { GroupsLoaderService } from './groups-loader.service';

describe('GroupsLoaderService', () => {
  let service: GroupsLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupsLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
