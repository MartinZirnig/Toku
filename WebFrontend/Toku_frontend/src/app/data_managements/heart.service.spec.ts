import { TestBed } from '@angular/core/testing';

import { HearthService } from './hearth.service';

describe('HearthService', () => {
  let service: HearthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HearthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
