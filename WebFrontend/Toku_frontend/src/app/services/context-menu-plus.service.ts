import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ContextMenuCoordinatorService } from './context-menu-coordinator.service';

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

  constructor(private coordinator: ContextMenuCoordinatorService) {}

  open(config: Omit<ContextMenuPlusConfig, 'visible'>) {
    this.coordinator.closeAll();
    this.configSubject.next({ ...config, visible: true });
  }

  close() {
    const current = this.configSubject.value;
    this.configSubject.next({ ...current, visible: false });
  }
}
