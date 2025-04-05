import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageAdresatorComponent } from './message-adresator.component';

describe('MessageAdresatorComponent', () => {
  let component: MessageAdresatorComponent;
  let fixture: ComponentFixture<MessageAdresatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageAdresatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageAdresatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
