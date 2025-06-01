import { Component, HostListener, Input, OnChanges } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActiveGroupMenuService} from '../../../services/active-group-menu-service.service';
import { AvailableGroupsModel } from '../../../data_managements/models/available-groups-model';
import { GroupsLoaderService } from '../../../data_managements/control-services/groups-loader.service';
import { Redirecter } from '../../../data_managements/redirecter.service';
import { ContextMenuGroupsService } from '../../../services/context-menu-groups.service';
import { ProfilePictureCircledComponent } from '../../profile-picture-circled/profile-picture-circled.component';

@Component({
  selector: 'app-active-group',
  imports: [CommonModule, NgIf, ProfilePictureCircledComponent], 
  templateUrl: './active-group.component.html',
  styleUrl: './active-group.component.scss'
})
export class ActiveGroupComponent {
  declare public name: string;
  declare public lastMessage: string;
  declare public time: string;
  
  @Input() data: any;
  @Input() active: boolean = false;
  @Input() disableContextMenu: boolean = false;
  @Input() hideMenuDots: boolean = false;
  ngOnChanges() {
    if (this.data) {
      this.load(this.data);
    }
  }

  constructor(
    public service: ActiveGroupMenuService,
    private loader: GroupsLoaderService,
    private redirecter: Redirecter,
    private contextMenuGroupsService: ContextMenuGroupsService
  ) { }

  public load(model: AvailableGroupsModel) : void {
    this.name = model.groupName;
    this.lastMessage = model.lastDecryptedMessage;
    this.time = model.lastOperation;
  }

  public onClick() {
    // Žádná podmínka, redirect funguje pro všechny skupiny včetně AI
    const request = this.loader.updateLastGroup(this.data.groupId)
    request.subscribe({
      next: response => {
        if (response.success)
          this.redirecter.Group(this.data.groupId);
        else
          console.log('failed setting last group: ' + response.description);
      },
      error: err => {
        console.error('error in setting last group: ', err);
      }
    })
  }

  editClicked() {
    if (this.disableContextMenu) return; // Zákaz editace AI skupiny
    this.redirecter.GroupSettings(this.data.groupId);
  }

  onMenuClick(event: MouseEvent) {
    if (this.hideMenuDots || this.disableContextMenu) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.contextMenuGroupsService.open({
      x: rect.right,
      y: rect.bottom,
      actions: {
        settings: () => this.editClicked(),
        mute: () => this.muteGroup()
      }
    });
  }

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    if (this.disableContextMenu) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuGroupsService.open({
      x: event.clientX,
      y: event.clientY,
      actions: {
        settings: () => this.editClicked(),
        mute: () => this.muteGroup()
      }
    });
    return true;
  }

  muteGroup() {
    if (this.disableContextMenu) return;
    // Implementace ztišení skupiny
    alert('Skupina ztišena!');
  }

  onGroupMenuClick(item: any, event: MouseEvent) {
    if (this.disableContextMenu) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    // ...existing code...
  }

  onContextMenu(event: MouseEvent) {
    if (this.disableContextMenu) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    // ...další logika context menu pokud existuje...
    return true;
  }
}
