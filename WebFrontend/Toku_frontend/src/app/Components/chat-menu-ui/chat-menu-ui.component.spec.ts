import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMenuUiComponent } from './chat-menu-ui.component';


describe('ChatMenuUiComponent', () => {
  let component: ChatMenuUiComponent;
  let fixture: ComponentFixture<ChatMenuUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMenuUiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatMenuUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
