import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextMenuGroupsComponent } from './context-menu-groups.component';

describe('ContextMenuGroupsComponent', () => {
  let component: ContextMenuGroupsComponent;
  let fixture: ComponentFixture<ContextMenuGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenuGroupsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContextMenuGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
