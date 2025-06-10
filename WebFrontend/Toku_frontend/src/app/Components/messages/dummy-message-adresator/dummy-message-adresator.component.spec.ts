import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DummyMessageAdresatorComponent } from './dummy-message-adresator.component';

describe('DummyMessageAdresatorComponent', () => {
  let component: DummyMessageAdresatorComponent;
  let fixture: ComponentFixture<DummyMessageAdresatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DummyMessageAdresatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DummyMessageAdresatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
