import { TestBed } from '@angular/core/testing';

import { EmojiPopUpOpenService } from './emoji-pop-up-open.service';

describe('EmojiPopUpOpenService', () => {
  let service: EmojiPopUpOpenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmojiPopUpOpenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
