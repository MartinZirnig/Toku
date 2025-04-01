import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuUiComponent } from './menu-ui.component';

describe('MenuUiComponent', () => {
  let component: MenuUiComponent;
  let fixture: ComponentFixture<MenuUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuUiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
