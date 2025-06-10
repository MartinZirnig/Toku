import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ContextMenuCoordinatorService } from './context-menu-coordinator.service';

export interface ContextMenuMessagesConfig {
  //messageId?: number;
  visible: boolean;
  x: number;
  y: number;
  showEdit: boolean;
  showReply: boolean;
  actions: {
    edit?: () => void;
    delete: () => void;
    react: () => void;
    copy: () => void;
    reply?: () => void;
  };
}

@Injectable({ providedIn: 'root' })
export class ContextMenuMessagesService {
  private configSubject = new BehaviorSubject<ContextMenuMessagesConfig>({
    visible: false,
    x: 0,
    y: 0,
    showEdit: false,
    showReply: false,
    actions: {
      delete: () => {},
      react: () => {},
      copy: () => {},
    },
   // messageId: 0
  });

  config$ = this.configSubject.asObservable();

  constructor(private coordinator: ContextMenuCoordinatorService) {}

  open(config: Omit<ContextMenuMessagesConfig, 'visible'>) {
    this.coordinator.closeAll();
    this.configSubject.next({ ...config, visible: true });
  }

  close() {
    const current = this.configSubject.value;
    this.configSubject.next({ ...current, visible: false });
  }
}
