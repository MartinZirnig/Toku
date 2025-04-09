import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DummyMessageSenderComponent } from './dummy-message-sender.component';

describe('DummyMessageSenderComponent', () => {
  let component: DummyMessageSenderComponent;
  let fixture: ComponentFixture<DummyMessageSenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DummyMessageSenderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DummyMessageSenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
