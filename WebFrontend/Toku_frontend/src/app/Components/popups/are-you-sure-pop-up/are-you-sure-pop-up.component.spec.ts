import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreYouSurePopUpComponent } from './are-you-sure-pop-up.component';

describe('AreYouSurePopUpComponent', () => {
  let component: AreYouSurePopUpComponent;
  let fixture: ComponentFixture<AreYouSurePopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreYouSurePopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreYouSurePopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
