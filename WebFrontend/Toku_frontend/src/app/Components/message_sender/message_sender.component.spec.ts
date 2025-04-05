import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Message_senderComponent } from './message_sender.component';

describe('MessageComponent', () => {
  let component: Message_senderComponent;
  let fixture: ComponentFixture<Message_senderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Message_senderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Message_senderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
