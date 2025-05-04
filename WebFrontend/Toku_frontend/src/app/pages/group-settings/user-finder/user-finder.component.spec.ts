import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFinderComponent } from './user-finder.component';

describe('UserFinderComponent', () => {
  let component: UserFinderComponent;
  let fixture: ComponentFixture<UserFinderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFinderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
