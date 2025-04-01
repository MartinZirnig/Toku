import { Component } from '@angular/core';

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
}
