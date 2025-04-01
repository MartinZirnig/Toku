import { Component } from '@angular/core';
import {
  buttonBackground,
  buttonHoverBackground,
  textColor,
  placeholderColor,
  textareaBackground,
  textareaFocusBackground,
  iconColor,
  iconHoverColor,
  chatItemBackground,
  chatItemHoverBackground,
  chatItemTextColor,
  chatItemSubTextColor,
  chatItemTimeColor,
  blurredBackground
} from '../../services/colors.service';

@Component({
  selector: 'app-chat-menu-ui',
  imports: [],
  templateUrl: './chat-menu-ui.component.html',
  styleUrl: './chat-menu-ui.component.scss'
})
export class ChatMenuUiComponent {
  showDropdown = false;
  isVisible = false;
  public toggleDropdownMenu() {
      this.isVisible = !this.isVisible 
      setTimeout( () => this.showDropdown = !this.showDropdown, 400)
  }

  public onChatItemClick(chatName: string) {
    alert(`Clicked on chat: ${chatName}`);
  }
}
