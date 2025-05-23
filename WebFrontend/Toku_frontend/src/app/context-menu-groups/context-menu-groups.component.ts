import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ContextMenuGroupsService, ContextMenuGroupsConfig } from '../services/context-menu-groups.service';
import { NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-context-menu-groups',
  standalone: true,
  imports: [NgIf, NgStyle],
  templateUrl: './context-menu-groups.component.html',
  styleUrl: './context-menu-groups.component.scss'
})
export class ContextMenuGroupsComponent {
  config: ContextMenuGroupsConfig = {
    visible: false,
    x: 0,
    y: 0,
    actions: {
      settings: () => {},
      mute: () => {},
    }
  };

  @ViewChild('menu', { static: false }) menuRef!: ElementRef;

  constructor(public menuService: ContextMenuGroupsService) {
    this.menuService.config$.subscribe(cfg => this.config = cfg);
  }

  get menuStyle() {
    const menuWidth = 192; // w-48
    const menuHeight = 120; // odhad pro dvě položky
    const padding = 8;

    let left = this.config?.x ?? 0;
    let top = this.config?.y ?? 0;

    if (left + menuWidth + padding > window.innerWidth) {
      left = window.innerWidth - menuWidth - padding;
    }
    if (top + menuHeight + padding > window.innerHeight) {
      top = window.innerHeight - menuHeight - padding;
    }

    left = Math.max(left, 0);
    top = Math.max(top, 0);

    return {
      position: 'fixed',
      left: left + 'px',
      top: top + 'px',
      zIndex: 9999
    };
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.config.visible) {
      const menuEl = this.menuRef?.nativeElement;
      if (menuEl && !menuEl.contains(event.target)) {
        this.menuService.close();
      }
    }
  }
}
