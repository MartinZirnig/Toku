import { NgFor } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, NgModule, Output } from '@angular/core';
import { NgModel } from '@angular/forms';
import { ProfilePictureCircledComponent } from '../profile-picture-circled/profile-picture-circled.component';
import { ColorManagerService } from '../../services/color-manager.service';
import { ColorSettingsModel } from '../../data_managements/models/color-settings-model';

@Component({
  selector: 'app-chat-login-popup-group-list',
  standalone: true,
  imports: [NgFor, ProfilePictureCircledComponent], // ensure only standalone components, directives, pipes, or NgModules are here
  templateUrl: './chat-login-popup-group-list.component.html',
  styleUrl: './chat-login-popup-group-list.component.scss'
})
export class ChatLoginPopupGroupListComponent implements AfterViewInit {
  @Output() selectGroup = new EventEmitter<{ name: string, id: number }>();
  @Output() close = new EventEmitter<void>();

  groups = [
    {
      name: 'Public Group Alpha',
      id: 101,
      picture: 'https://randomuser.me/api/portraits/lego/1.jpg'
    },
    {
      name: 'Beta Chat',
      id: 202,
      picture: 'https://randomuser.me/api/portraits/lego/2.jpg'
    },
    {
      name: 'Gamma Room',
      id: 303,
      picture: 'https://randomuser.me/api/portraits/lego/3.jpg'
    },
    {
      name: 'Delta Squad',
      id: 404,
      picture: 'https://randomuser.me/api/portraits/lego/4.jpg'
    },
    {
      name: 'Omega Lounge',
      id: 505,
      picture: 'https://randomuser.me/api/portraits/lego/5.jpg'
    },
    {
      name: 'Sigma Friends',
      id: 606,
      picture: 'https://randomuser.me/api/portraits/lego/6.jpg'
    },
    {
      name: 'Lambda Crew',
      id: 707,
      picture: 'https://randomuser.me/api/portraits/lego/7.jpg'
    },
    {
      name: 'Zeta Zone',
      id: 808,
      picture: 'https://randomuser.me/api/portraits/lego/8.jpg'
    }
  ];

  public csm: ColorSettingsModel;

  constructor(
    private colorManager: ColorManagerService,
    private el: ElementRef
  ) {
    // Oprav inicializaci, vždy nastav csm na platný model
    this.csm = this.colorManager.csm ?? this.colorManager['GetDefault']?.() ?? ({} as ColorSettingsModel);
  }

  ngAfterViewInit() {
    // Ochrana proti undefined
    if (!this.csm || !this.csm.overlayBackground) return;

    const root = this.el.nativeElement ?? document.querySelector('app-chat-login') ?? document.documentElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    const csm = this.csm;
    
    setVar('--popup-overlay-bg', csm.overlayBackground.toRgbaString());
    setVar('--popup-bg', csm.popupBackground.toRgbaString());
    setVar('--popup-border', csm.popupBorder.toRgbaString());
    setVar('--primary-text', csm.primaryText.toRgbaString());
    setVar('--card-bg', csm.cardBackground.toRgbaString());
    setVar('--list-border', csm.listBorder.toRgbaString());
    setVar('--list-divider', csm.listDivider.toRgbaString());
    setVar('--popup-shadow', csm.popupShadow.toRgbaString());
    setVar('--highlight-bg', csm.highlightBackground.toRgbaString());
    setVar('--secondary-text', csm.secondaryText.toRgbaString());
    setVar('--button-shadow', csm.buttonShadow.toRgbaString());
    setVar('--gradient-btn-bg', csm.gradientButton?.toLinearGradientString(135) ?? '');
    setVar('--gradient-btn-bg-hover', csm.gradientButtonHover?.toLinearGradientString(135) ?? '');
    setVar('--button-text', csm.buttonText.toRgbaString());
    setVar('--close-btn-bg', csm.closeButtonBackground.toRgbaString());
    setVar('--close-btn-bg-hover', csm.closeButtonBackgroundHover.toRgbaString());
    setVar('--close-btn-icon', csm.closeButtonIcon.toRgbaString());
  }

  select(group: any) {
    this.selectGroup.emit({ name: group.name, id: group.id });
  }
}
