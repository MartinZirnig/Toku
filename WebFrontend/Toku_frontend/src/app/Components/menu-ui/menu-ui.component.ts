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
import { Router } from '@angular/router';


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

  

  public constructor(public menuService: OpenAndcloseMenuService, private router: Router) {
   
  }

  showMenu() {
    if (!this.menuService.isVisible) {
      this.menuService.toggleDropdownMenu();
    }
    else {
      
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
      this.menuService.isVisible = false; // Close the menu-ui
    }
  }

  goToSettings() {
    this.router.navigate(['/main/user-settings']);
  }
  goToLogout() {
    this.router.navigate(['/login']);
    sessionStorage.removeItem('relationCode');
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


