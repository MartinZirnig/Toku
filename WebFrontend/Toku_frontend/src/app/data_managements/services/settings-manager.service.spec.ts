import { TestBed } from '@angular/core/testing';

import { SettingsManagerService } from './settings-manager.service';

describe('SettingsManagerService', () => {
  let service: SettingsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
