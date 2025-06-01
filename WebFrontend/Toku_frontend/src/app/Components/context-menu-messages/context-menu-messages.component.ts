import { NgIf, NgStyle } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ContextMenuMessagesService, ContextMenuMessagesConfig } from '../../services/context-menu-messages.service';

@Component({
  selector: 'app-context-menu-messages',
  imports: [NgIf, NgStyle],
  templateUrl: './context-menu-messages.component.html',
  styleUrls: ['./context-menu-messages.component.scss'],
  standalone: true
})
export class ContextMenuMessagesComponent {
  config: ContextMenuMessagesConfig = {
    visible: false,
    x: 0,
    y: 0,
    showEdit: false,
    showReply: false,
    actions: {
      delete: () => {},
      react: () => {},
      copy: () => {},
    }
  };

  @ViewChild('menu', { static: false }) menuRef!: ElementRef;

  constructor(public menuService: ContextMenuMessagesService) {
    this.menuService.config$.subscribe(cfg => this.config = cfg);
  }

  get menuStyle() {
    const menuWidth = 192; // odpovídá w-48 (48*4px)
    const menuHeight = 240; // odhad, případně uprav podle obsahu
    const padding = 8;

    let left = this.config?.x ?? 0;
    let top = this.config?.y ?? 0;

    // Omez pravý okraj
    if (left + menuWidth + padding > window.innerWidth) {
      left = window.innerWidth - menuWidth - padding;
    }
    // Omez spodní okraj
    if (top + menuHeight + padding > window.innerHeight) {
      top = window.innerHeight - menuHeight - padding;
    }

    // Omez levý/horní okraj (NIKDY záporné!)
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
    // Pokud je menu otevřené a klikneš mimo menu, zavři ho
    if (this.config.visible) {
      const menuEl = this.menuRef?.nativeElement;
      if (menuEl && !menuEl.contains(event.target)) {
        this.menuService.close();
      }
    }
  }
}
// není třeba měnit, už podporuje showReply a actions.reply
