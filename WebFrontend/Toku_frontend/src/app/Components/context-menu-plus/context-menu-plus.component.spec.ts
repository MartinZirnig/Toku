import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextMenuPlusComponent } from './context-menu-plus.component';

describe('ContextMenuPlusComponent', () => {
  let component: ContextMenuPlusComponent;
  let fixture: ComponentFixture<ContextMenuPlusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenuPlusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContextMenuPlusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
