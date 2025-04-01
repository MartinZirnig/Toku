import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputUIComponent } from './input-ui.component';

describe('InputUIComponent', () => {
  let component: InputUIComponent;
  let fixture: ComponentFixture<InputUIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputUIComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputUIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
