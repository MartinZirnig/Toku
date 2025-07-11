import { Component, HostListener, Input, OnChanges, SimpleChanges, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenAndcloseMenuService } from '../../../services/open-andclose-menu.service';
import { IconComponent } from '../../icon/icon.component';
import { User } from '../../../data_managements/user';
import { Redirecter } from '../../../data_managements/redirecter.service';
import { Heart } from '../../../data_managements/heart.service';
import { MessagerService } from '../../../data_managements/messager.service';
import { ProfilePictureCircledComponent } from "../../profile-picture-circled/profile-picture-circled.component";
import { ColorManagerService } from '../../../services/color-manager.service';
import { ColorSettingsModel } from '../../../data_managements/models/color-settings-model';

@Component({
  selector: 'app-menu-ui',
  standalone: true,
  imports: [CommonModule, IconComponent, ProfilePictureCircledComponent],
  templateUrl: './menu-ui.component.html',
  styleUrls: ['./menu-ui.component.scss']
})
export class MenuUiComponent implements AfterViewInit {
  @Input() picture?: string;

  public csm: ColorSettingsModel;

  showDropdown_user = false;
  isVisible_user = false;
  active_user = false;

  public constructor(
    public menuService: OpenAndcloseMenuService, 
    private redirecter: Redirecter,
    private heart: Heart,
    private messager: MessagerService,
    private colorManager: ColorManagerService,
    private el: ElementRef
  ) {
    this.csm = this.colorManager.csm;
  }

  ngAfterViewInit() {
    if (!this.csm) return;
    const root = this.el.nativeElement ?? document.documentElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    setVar('--menu-btn-bg', this.csm.menuButtonBackground.toRgbaString());
    setVar('--menu-btn-bg-hover', this.csm.menuButtonBackgroundHover.toRgbaString());
    setVar('--menu-btn-gradient-hover', this.csm.menuButtonGradientHover.toLinearGradientString(135));
    setVar('--menu-btn-icon-hover', this.csm.menuButtonIconHover.toRgbaString());
    setVar('--menu-bar-bg', this.csm.menuBarBackground.toLinearGradientString(180));
    setVar('--menu-dropdown-bg', this.csm.menuDropdownBackground.toRgbaString());
    setVar('--menu-dropdown-shadow', this.csm.menuDropdownShadow.toRgbaString());
    setVar('--menu-dropdown-item-hover-bg', this.csm.menuDropdownItemHoverBackground.toRgbaString());
  }

  showMenu() {
    
      this.menuService.toggleDropdownMenu();
    
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
    this.redirecter.Settings();
  }


  goToLogout() {
    User.ClearId();
    this.heart.stopBeat();
    this.redirecter.Login();
    this.messager.closeSocket();
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


