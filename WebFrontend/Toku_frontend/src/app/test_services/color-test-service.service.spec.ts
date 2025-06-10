import { TestBed } from '@angular/core/testing';

import { ColorTestServiceService } from './color-test-service.service';

describe('ColorTestServiceService', () => {
  let service: ColorTestServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorTestServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
