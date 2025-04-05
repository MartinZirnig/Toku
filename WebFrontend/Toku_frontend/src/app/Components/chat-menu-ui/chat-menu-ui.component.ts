import { Component, HostListener } from '@angular/core';
import {
  chatItemBackground,
  chatItemHoverBackground,
  chatItemTextColor,
  chatItemSubTextColor,
  chatItemTimeColor,
  blurredBackground
} from '../../services/colors.service';
import { OpenAndcloseMenuService } from '../../services/open-andclose-menu.service';
import { CommonModule, NgIf } from '@angular/common';


@Component({
  selector: 'app-chat-menu-ui',
  templateUrl: './chat-menu-ui.component.html',
  imports: [CommonModule, NgIf], // Ensure CommonModule is imported
  styleUrl: './chat-menu-ui.component.scss'
})
export class ChatMenuUiComponent {
  public isEditing = false;
  public chats = [
    { name: 'Ondřej Šibrava', preview: 'Last message preview...', time: '3:26' },
    { name: 'P3.B sk.2', preview: 'Last message preview...', time: '15:23' }
  ];

  constructor(public menuService: OpenAndcloseMenuService) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (window.innerWidth < 700) {
      this.menuService.showDropdown = false; // Close the chat menu
      this.menuService.isVisible = false; // Ensure animation state is updated
    }
  }

  public onEditClick(): void {
    this.isEditing = !this.isEditing;
  }

  public onChatItemClick(chatName: string): void {
    if (!this.isEditing) {
      alert(`Clicked on chat: ${chatName}`);
    }
  }
}
