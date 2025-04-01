import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChatMenuUiComponent } from '../chat-menu-ui/chat-menu-ui.component';

@Component({
  selector: 'app-menu-ui',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu-ui.component.html',
  styleUrls: ['./menu-ui.component.scss']
})
export class MenuUiComponent {
  showDropdown = false;
  isVisible = false;
  active = false;

  showMenu() {
    
  }


  toggleDropdown() {
    if (!this.active)
    {
      this.isVisible = true;
      this.showDropdown = true;
      setTimeout(() => this.active = true, 1);
    }
  }
  @HostListener('document:click')
  onDocumentClick() {
    if (this.active) {
      this.isVisible = false;
      setTimeout(() => this.showDropdown = false, 400);
      this.active = false;
    }
  }

}


