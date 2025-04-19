import { TestBed } from '@angular/core/testing';

import { MainInputService } from './main-input.service';

describe('MainInputService', () => {
  let service: MainInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainInputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
