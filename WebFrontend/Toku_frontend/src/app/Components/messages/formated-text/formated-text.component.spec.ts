import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatedTextComponent } from './formated-text.component';

describe('FormatedTextComponent', () => {
  let component: FormatedTextComponent;
  let fixture: ComponentFixture<FormatedTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormatedTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormatedTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
