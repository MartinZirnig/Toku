import { Component } from '@angular/core';
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
/* 
 @ViewChild('chatMenuContainer', { static: true }) chatMenuContainer!: ElementRef;
*/
  constructor(public menuService: OpenAndcloseMenuService) {}
/*
  ngAfterViewInit(): void {
    if (this.chatMenuContainer) {
      this.setupChatMenuUI();
    } else {
      console.error('chatMenuContainer is not defined');
    }
  }

  setupChatMenuUI(): void {
    alert("setupChatMenuUI");
    if (!this.chatMenuContainer) {
      console.error('chatMenuContainer is not defined');
      return;
    }
    const container = this.chatMenuContainer.nativeElement;

   // Dynamically set styles for the chat menu container
    container.style.backgroundColor = blurredBackground;

    // Set dynamic styles for chat items
    const chatItems = container.querySelectorAll('chat-item');
    chatItems.forEach((item) => {
      (item as HTMLElement).style.backgroundColor = chatItemBackground;
      (item as HTMLElement).style.color = chatItemTextColor;

      // Add hover effects dynamically
      item.addEventListener('mouseenter', () => {
        (item as HTMLElement).style.backgroundColor = chatItemHoverBackground;
      });
      item.addEventListener('mouseleave', () => {
        (item as HTMLElement).style.backgroundColor = chatItemBackground;
      });

      // Set dynamic styles for subtext and time
      const subtext = item.querySelector('chat-item-subtext');
      const time = item.querySelector('chat-item-time');
      if (subtext) {
        (subtext as HTMLElement).style.color = chatItemSubTextColor;
      }
      if (time) {
        (time as HTMLElement).style.color = chatItemTimeColor;
      }
    });
    
  }
  */
  public onChatItemClick(chatName: string): void {
    alert(`Clicked on chat: ${chatName}`);
  }
}
