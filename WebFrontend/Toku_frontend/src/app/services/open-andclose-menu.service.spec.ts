import { TestBed } from '@angular/core/testing';

import { OpenAndcloseMenuService } from './open-andclose-menu.service';

describe('OpenAndcloseMenuService', () => {
  let service: OpenAndcloseMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenAndcloseMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
