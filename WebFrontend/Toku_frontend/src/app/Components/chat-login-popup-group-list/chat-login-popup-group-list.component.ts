import { NgFor } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, NgModule, OnInit, Output } from '@angular/core';
import { NgModel } from '@angular/forms';
import { ProfilePictureCircledComponent } from '../profile-picture-circled/profile-picture-circled.component';
import { ColorManagerService } from '../../services/color-manager.service';
import { ColorSettingsModel } from '../../data_managements/models/color-settings-model';
import { GroupService } from '../../data_managements/services/group-service.service';
import { FileService } from '../../data_managements/services/file.service';

@Component({
  selector: 'app-chat-login-popup-group-list',
  standalone: true,
  imports: [NgFor, ProfilePictureCircledComponent], // ensure only standalone components, directives, pipes, or NgModules are here
  templateUrl: './chat-login-popup-group-list.component.html',
  styleUrl: './chat-login-popup-group-list.component.scss'
})
export class ChatLoginPopupGroupListComponent implements AfterViewInit, OnInit {
  @Output() selectGroup = new EventEmitter<{ name: string, id: number }>();
  @Output() close = new EventEmitter<void>();

  groups: GroupDefinition[] = [
    /*
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
      */
  ];

  public csm: ColorSettingsModel;

  constructor(
    private colorManager: ColorManagerService,
    private el: ElementRef,
    private groupService: GroupService,
    private fileService: FileService
  ) {
    // Oprav inicializaci, vždy nastav csm na platný model
    this.csm = this.colorManager.csm ?? this.colorManager['GetDefault']?.() ?? ({} as ColorSettingsModel);
  }
  ngOnInit(): void {
    this.groupService.getPublicGroups().subscribe({
      next: (groups) => {
        groups.forEach(group => {
          this.fileService.getGroupFile(String(group.pictureId)).subscribe({
            next: (file) => {
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  const pictureUrl = reader.result as string;
                  this.groups.push(new GroupDefinition(group.name, group.id, pictureUrl));
                };
                reader.readAsDataURL(file.body as Blob);
              }
            },
            error: (err) => {
              console.error(`Error loading picture for group ${group.name}:`, err);
              this.groups.push(new GroupDefinition(group.name, group.id));
            }
          })
        });
      },
      error: (err) => {
        console.error('Error loading groups:', err);
      }
    })
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

class GroupDefinition{
  constructor(
    public name: string,
    public id: number,
    public picture?: string
  ) {}
}