import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ContextMenuPlusConfig {
  visible: boolean;
  x: number;
  y: number;
  actions: {
    groupSettings: () => void;
    chatLogin: () => void;
  };
}

@Injectable({ providedIn: 'root' })
export class ContextMenuPlusService {
  private configSubject = new BehaviorSubject<ContextMenuPlusConfig>({
    visible: false,
    x: 0,
    y: 0,
    actions: {
      groupSettings: () => {},
      chatLogin: () => {},
    }
  });

  config$ = this.configSubject.asObservable();

  open(config: Omit<ContextMenuPlusConfig, 'visible'>) {
    this.configSubject.next({ ...config, visible: true });
  }

  close() {
    const current = this.configSubject.value;
    this.configSubject.next({ ...current, visible: false });
  }
}
