import { Component, HostListener, Input, OnChanges, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { User } from '../../../../data_managements/user';
import { MessagerService } from '../../../../data_managements/messager.service';
import { ActiveGroupMenuService} from '../../../../services/active-group-menu-service.service';
import { AvailableGroupsModel } from '../../../../data_managements/models/available-groups-model';
import { GroupsLoaderService } from '../../../../data_managements/control-services/groups-loader.service';
import { Redirecter } from '../../../../data_managements/redirecter.service';
import { ContextMenuGroupsService } from '../../../../services/context-menu-groups.service';
import { ProfilePictureCircledComponent } from '../../../profile-picture-circled/profile-picture-circled.component';
import { ColorManagerService } from '../../../../services/color-manager.service';
import { ColorSettingsModel } from '../../../../data_managements/models/color-settings-model';
import { AiService } from '../../../../data_managements/services/ai-service.service';
import { GroupService } from '../../../../data_managements/services/group-service.service';
import { MuteModel } from '../../../../data_managements/models/mute-model';
import { PopUpService } from '../../../../services/pop-up.service';


@Component({
  selector: 'app-active-group',
  imports: [CommonModule, NgIf, ProfilePictureCircledComponent], 
  templateUrl: './active-group.component.html',
  styleUrl: './active-group.component.scss'
})
export class ActiveGroupComponent implements AfterViewInit {
  declare public name: string;
  declare public lastMessage: string;
  declare public time: string;
  declare public groupId: number;
  
  @Input() data: any;
  @Input() active: boolean = false;
  @Input() disableContextMenu: boolean = false;
  @Input() hideMenuDots: boolean = false;
  @Input() picture?: string;
  @Input() IsMuted: boolean = false; // nový input
  public csm: ColorSettingsModel;

  ngOnChanges() {
    if (this.data) {
      this.load(this.data);
    }
  }

  constructor(
    public service: ActiveGroupMenuService,
    private loader: GroupsLoaderService,
    private redirecter: Redirecter,
    private contextMenuGroupsService: ContextMenuGroupsService,
    private el: ElementRef,
    private colorManager: ColorManagerService,
    private ai: AiService,
    private messager: MessagerService,
    private groupService: GroupService,
    private popuService: PopUpService
  ) { 
    this.csm = this.colorManager.csm;
    this.messager.appendCallback("new-message", this.onMessage.bind(this));
  }

  ngAfterViewInit() {
    if (!this.csm) return;
    const root = this.el.nativeElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    const csm = this.csm;
    setVar('--active-bg', csm.highlightBackground.toRgbaString());
    setVar('--inactive-bg', csm.menuBackground.toRgbaString());
    setVar('--active-ring', csm.listItemRing.toRgbaString());
    setVar('--primary-text', csm.primaryText.toRgbaString());
    setVar('--secondary-text', csm.secondaryText.toRgbaString());
    setVar('--last-message-text', csm.secondaryText.toRgbaString());
    setVar('--avatar-bg', csm.avatarGradientBackground.toLinearGradientString(135));
    setVar('--menu-btn-bg', csm.menuButtonBackground.toRgbaString());
    setVar('--menu-btn-hover-bg', csm.menuButtonBackgroundHover.toRgbaString());
    setVar('--menu-btn-icon-hover', csm.menuButtonIconHover.toRgbaString());
    setVar('--time-text', csm.secondaryText.toRgbaString());
  }

  public load(model: AvailableGroupsModel) : void {
    this.name = model.groupName;
    this.lastMessage = model.lastDecryptedMessage;
    this.time = model.lastOperation;
    this.groupId = model.groupId;
  }

  public onClick() {
    this.messager.writeSocket(`typing-stop ${User.ActiveGroupId}&${User.Name}`);

    // Žádná podmínka, redirect funguje pro všechny skupiny včetně AI
    const request = this.loader.updateLastGroup(this.data.groupId)
    request.subscribe({
      next: response => {
        if (response.success){
          this.redirecter.Group(this.data.groupId);           
        }
        else
          console.log('failed setting last group: ' + response.description);
      },
      error: err => {
        console.error('error in setting last group: ', err);
      }
    })
  }

  editClicked() {
    if (this.disableContextMenu) return; // Zákaz editace AI skupiny
    this.redirecter.GroupSettings(this.data.groupId);
  }

  onMenuClick(event: MouseEvent) {
    if (this.hideMenuDots || this.disableContextMenu) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.contextMenuGroupsService.open({
      x: rect.right,
      y: rect.bottom,
      actions: {
        settings: () => this.editClicked(),
        mute: () => this.muteGroup()
      },
      IsMuted: this.IsMuted // předání do context menu
    } as any); // typová poznámka kvůli rozšíření configu
  }

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    if (this.disableContextMenu) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuGroupsService.open({
      x: event.clientX,
      y: event.clientY,
      actions: {
        settings: () => this.editClicked(),
        mute: () => this.muteGroup()
      },
      IsMuted: this.IsMuted // předání do context menu
    } as any);
    return true;
  }

  muteGroup() {
    if (this.disableContextMenu) return;
    this.IsMuted = !this.IsMuted; // přepnutí stavu
    const event = this.IsMuted
      ? "Group muted"
      : "Group unmuted";

    const model = new MuteModel(
      this.groupId, this.IsMuted
    )
    this.groupService.muteGroup(model).subscribe({
      next: response => {
        if (response.success){
          this.popuService.showMessage(`Skupina ${event}`);
        } else {
          console.error("cannot change mute state: ", response.description);
        }
      },
      error: err => {
        console.error("cannot change mute state: ", err);
      }
    })
  }

  onGroupMenuClick(item: any, event: MouseEvent) {
    if (this.disableContextMenu) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    // ...existing code...
  }

  onContextMenu(event: MouseEvent) {
    if (this.disableContextMenu) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    // ...další logika context menu pokud existuje...
    return true;
  }
  onMessage(data: string) {
    const splited = data.split('#');
    const groupId = splited[1];

    if (Number(groupId) === this.groupId)
    {
      const splitedData = splited[2].split('&');
      const content = splitedData[1];
      this.lastMessage = content;
    }
  }
}
