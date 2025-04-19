import { Component, HostListener } from '@angular/core';
import { OpenAndcloseMenuService } from '../../services/open-andclose-menu.service';
import { CommonModule, NgIf } from '@angular/common';
import {
  chatItemBackground,
  chatItemHoverBackground,
  chatItemTextColor,
  chatItemSubTextColor,
  chatItemTimeColor,
  blurredBackground
} from '../../services/colors.service';
import { ActiveGroupComponent } from './active-group/active-group.component';
import { ActiveGroupMenuService } from '../../services/active-group-menu-service.service';
import { GroupsLoaderService } from '../../data_managements/control-services/groups-loader.service';
import { AvailableGroupsModel } from '../../data_managements/models/available-groups-model';


@Component({
  selector: 'app-chat-menu-ui',
  templateUrl: './chat-menu-ui.component.html',
  imports: [CommonModule, NgIf, ActiveGroupComponent], // Ensure CommonModule is imported
  styleUrl: './chat-menu-ui.component.scss'
})
export class ChatMenuUiComponent {
  declare public items: [AvailableGroupsModel];

 

  constructor(
    public menuService: OpenAndcloseMenuService,
    public activeMenuService: ActiveGroupMenuService,
    public loader: GroupsLoaderService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (window.innerWidth < 700) {
      this.menuService.showDropdown = false; // Close the chat menu
      this.menuService.isVisible = false; // Ensure animation state is updated
    }
  }

  ngOnInit() {
    const request = this.loader.getGroups()
    request.subscribe({
      next: response => {
        console.log(response)
        this.items = response;
      },
      error: err => {
        console.error('cannot load groups', err)
      }
    });
  }


  public onEditClick(): void {
    this.activeMenuService.inEditMode = !this.activeMenuService.inEditMode;
  }

  public onChatItemClick(chatName: string): void {
    if (!this.activeMenuService.inEditMode) {
      alert(`Clicked on chat: ${chatName}`);
    }
  }
}
