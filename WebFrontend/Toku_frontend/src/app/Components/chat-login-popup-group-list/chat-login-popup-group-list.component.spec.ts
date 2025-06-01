import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatLoginPopupGroupListComponent } from './chat-login-popup-group-list.component';

describe('ChatLoginPopupGroupListComponent', () => {
  let component: ChatLoginPopupGroupListComponent;
  let fixture: ComponentFixture<ChatLoginPopupGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatLoginPopupGroupListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatLoginPopupGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
