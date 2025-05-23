import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ContextMenuMessagesConfig {
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
    }
  });

  config$ = this.configSubject.asObservable();

  open(config: Omit<ContextMenuMessagesConfig, 'visible'>) {
    this.configSubject.next({ ...config, visible: true });
  }

  close() {
    const current = this.configSubject.value;
    this.configSubject.next({ ...current, visible: false });
  }
}
