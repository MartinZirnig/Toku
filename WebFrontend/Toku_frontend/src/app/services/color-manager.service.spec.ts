import { TestBed } from '@angular/core/testing';

import { ColorManagerService } from './color-manager.service';

describe('ColorManagerService', () => {
  let service: ColorManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
