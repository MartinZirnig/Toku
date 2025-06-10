import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorBasedPopupComponent } from './color-based-popup.component';

describe('ColorBasedPopupComponent', () => {
  let component: ColorBasedPopupComponent;
  let fixture: ComponentFixture<ColorBasedPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorBasedPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColorBasedPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
