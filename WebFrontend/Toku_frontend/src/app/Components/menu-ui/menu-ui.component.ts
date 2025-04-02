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

  public constructor(public menuService: OpenAndcloseMenuService) {

  }

  showMenu() {
    this.menuService.toggleDropdownMenu();
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


