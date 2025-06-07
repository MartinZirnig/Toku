import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ContextMenuCoordinatorService } from './context-menu-coordinator.service';

export interface ContextMenuGroupsConfig {
  visible: boolean;
  x: number;
  y: number;
  actions: {
    settings: () => void;
    mute: () => void;
  };
}

@Injectable({ providedIn: 'root' })
export class ContextMenuGroupsService {
  private configSubject = new BehaviorSubject<ContextMenuGroupsConfig>({
    visible: false,
    x: 0,
    y: 0,
    actions: {
      settings: () => {},
      mute: () => {},
    }
  });

  config$ = this.configSubject.asObservable();

  constructor(private coordinator: ContextMenuCoordinatorService) {}

  open(config: Omit<ContextMenuGroupsConfig, 'visible'>) {
    this.coordinator.closeAll();
    this.configSubject.next({ ...config, visible: true });
  }

  close() {
    const current = this.configSubject.value;
    this.configSubject.next({ ...current, visible: false });
  }
}
