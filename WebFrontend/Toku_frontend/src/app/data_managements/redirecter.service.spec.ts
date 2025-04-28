import { TestBed } from '@angular/core/testing';

import { Redirecter } from './redirecter.service';

describe('RedirecterService', () => {
  let service: Redirecter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Redirecter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
