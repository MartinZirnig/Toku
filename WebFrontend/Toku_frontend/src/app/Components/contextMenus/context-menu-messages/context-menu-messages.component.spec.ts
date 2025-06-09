import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextMenuMessagesComponent } from './context-menu-messages.component';

describe('ContextMenuMessagesComponent', () => {
  let component: ContextMenuMessagesComponent;
  let fixture: ComponentFixture<ContextMenuMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenuMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContextMenuMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
