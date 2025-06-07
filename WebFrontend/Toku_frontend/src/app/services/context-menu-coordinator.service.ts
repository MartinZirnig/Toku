import { Injectable, Injector } from '@angular/core';
import { ContextMenuGroupsService } from './context-menu-groups.service';
import { ContextMenuPlusService } from './context-menu-plus.service';
import { ContextMenuMessagesService } from './context-menu-messages.service';

@Injectable({ providedIn: 'root' })
export class ContextMenuCoordinatorService {
  constructor(private injector: Injector) {}

  closeAll() {
    // Dynamicky získá instance služeb, čímž se přeruší cyklus v DI
    this.injector.get(ContextMenuGroupsService).close();
    this.injector.get(ContextMenuPlusService).close();
    this.injector.get(ContextMenuMessagesService).close();
  }
}
