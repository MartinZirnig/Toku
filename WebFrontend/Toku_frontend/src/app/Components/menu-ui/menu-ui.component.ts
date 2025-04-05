import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  buttonBackground,
  buttonHoverBackground,
  textColor,
  placeholderColor,
  textareaBackground,
  textareaFocusBackground,
  iconColor,
  iconHoverColor,
} from '../../services/colors.service';
import { OpenAndcloseMenuService } from '../../services/open-andclose-menu.service';
import { IconComponent } from '../icon/icon.component';


@Component({
  selector: 'app-menu-ui',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './menu-ui.component.html',
  styleUrls: ['./menu-ui.component.scss']
})
export class MenuUiComponent {
  showDropdown_user = false;
  isVisible_user = false;
  active_user = false;

  isVisible_menu = false;

  public constructor(public menuService: OpenAndcloseMenuService) {

  }

  showMenu() {
    if (!this.isVisible_menu) {
      this.menuService.toggleDropdownMenu();
      this.isVisible_menu = !this.isVisible_menu
    }
    else {
      this.isVisible_menu = !this.isVisible_menu
      this.menuService.toggleDropdownMenu();
    }
  
    
  }


  toggleDropdown() {
    if (!this.active_user)
    {
      this.isVisible_user = true;
      this.showDropdown_user = true;
      setTimeout(() => this.active_user = true, 1);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (window.innerWidth < 700) {
      this.menuService.showDropdown = false; // Close the chat menu
      this.isVisible_menu = false; // Close the menu-ui
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.active_user) {
      this.isVisible_user = false;
      setTimeout(() => this.showDropdown_user = false, 400);
      this.active_user = false;
    }
  }

}


