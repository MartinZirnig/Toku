import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojisPopUpComponent } from './emojis-pop-up.component';

describe('EmojisPopUpComponent', () => {
  let component: EmojisPopUpComponent;
  let fixture: ComponentFixture<EmojisPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmojisPopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmojisPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
