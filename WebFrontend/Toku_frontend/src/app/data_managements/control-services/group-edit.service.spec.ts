import { TestBed } from '@angular/core/testing';

import { GroupEditService } from './group-edit.service';

describe('GroupEditService', () => {
  let service: GroupEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
