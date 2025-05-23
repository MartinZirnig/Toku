import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePictureCircledComponent } from './profile-picture-circled.component';

describe('ProfilePictureCircledComponent', () => {
  let component: ProfilePictureCircledComponent;
  let fixture: ComponentFixture<ProfilePictureCircledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePictureCircledComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilePictureCircledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
