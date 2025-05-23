import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  open(config: Omit<ContextMenuGroupsConfig, 'visible'>) {
    this.configSubject.next({ ...config, visible: true });
  }

  close() {
    const current = this.configSubject.value;
    this.configSubject.next({ ...current, visible: false });
  }
}
