import { NgIf, NgStyle, AsyncPipe } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ContextMenuMessagesService, ContextMenuMessagesConfig } from '../../services/context-menu-messages.service';
import { DeletePopupService } from '../delete-popup/delete-popup.service';
import { DeletePopupComponent } from '../delete-popup/delete-popup.component';
import { MessageControllService } from '../../data_managements/control-services/message-controll.service';

// Rozšiř typ actions o onDeleteMessage
type ActionsWithDelete = ContextMenuMessagesConfig['actions'] & { onDeleteMessage?: () => void };
type ContextMenuMessagesConfigWithId = Omit<ContextMenuMessagesConfig, 'actions'> & {
  actions: ActionsWithDelete;
  messageId?: string;
};

@Component({
  selector: 'app-context-menu-messages',
  imports: [NgIf, NgStyle, AsyncPipe, DeletePopupComponent],
  templateUrl: './context-menu-messages.component.html',
  styleUrls: ['./context-menu-messages.component.scss'],
  standalone: true
})
export class ContextMenuMessagesComponent {
  config: ContextMenuMessagesConfigWithId = {
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

  constructor(
    public menuService: ContextMenuMessagesService,
    public deletePopupService: DeletePopupService,
    private msgCtrl: MessageControllService // přidej službu pro mazání zpráv
  ) {
    this.menuService.config$.subscribe(cfg => {
      // Přetypuj actions na ActionsWithDelete
      const actions = cfg.actions as ActionsWithDelete;
      actions.delete = async () => {
        const messageId = (cfg as ContextMenuMessagesConfigWithId).messageId;
        if (messageId === undefined || messageId === null || messageId === '') return;
        const result = await this.deletePopupService.open(messageId);
        if (result === 'all') {
          let idNum: number | undefined;
          if (typeof messageId === 'number') {
            idNum = messageId;
          } else if (typeof messageId === 'string' && messageId.trim() !== '') {
            idNum = Number(messageId);
          }
          if (typeof idNum === 'number' && !isNaN(idNum)) {
            this.msgCtrl.removeMessage(idNum).subscribe({
              next: (res) => {
                if (actions.onDeleteMessage) {
                  actions.onDeleteMessage();
                }
              },
              error: (err) => {
                if (actions.onDeleteMessage) {
                  actions.onDeleteMessage();
                }
              }
            });
          } else {
            if (actions.onDeleteMessage) {
              actions.onDeleteMessage();
            }
          }
        } else if (result === 'me') {
          if (actions.onDeleteMessage) {
            actions.onDeleteMessage();
          }
        }
      };
      this.config = { ...cfg, actions };
    });
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
