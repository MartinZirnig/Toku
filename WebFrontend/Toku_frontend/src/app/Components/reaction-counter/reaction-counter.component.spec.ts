import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactionCounterComponent } from './reaction-counter.component';

describe('ReactionCounterComponent', () => {
  let component: ReactionCounterComponent;
  let fixture: ComponentFixture<ReactionCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactionCounterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactionCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
