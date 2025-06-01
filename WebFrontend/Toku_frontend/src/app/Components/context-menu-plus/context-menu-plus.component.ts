import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';
import { ContextMenuPlusService, ContextMenuPlusConfig } from '../../services/context-menu-plus.service';

@Component({
  selector: 'app-context-menu-plus',
  standalone: true,
  imports: [NgIf, NgStyle],
  templateUrl: './context-menu-plus.component.html',
  styleUrl: './context-menu-plus.component.scss'
})
export class ContextMenuPlusComponent {
  config: ContextMenuPlusConfig = {
    visible: false,
    x: 0,
    y: 0,
    actions: {
      groupSettings: () => { },
      chatLogin: () => { },
    }
  };

  @ViewChild('menu', { static: false }) menuRef!: ElementRef;

  constructor(public menuService: ContextMenuPlusService) {
    this.menuService.config$.subscribe(cfg => this.config = cfg);
  }

  get menuStyle() {
    const menuWidth = 192;
    const menuHeight = 120;
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
