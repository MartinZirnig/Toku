import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, AfterViewInit, ElementRef } from '@angular/core';
import { GroupSettingsService } from '../../services/group-settings.service';
import { KnownUserDataModel } from '../../data_managements/models/known-user-data-model';
import { UserControlService } from '../../data_managements/control-services/user-control-service.service';
import { ColorManagerService } from '../../services/color-manager.service';
import { ColorSettingsModel } from '../../data_managements/models/color-settings-model';

@Component({
  selector: 'app-user-finder',
  imports: [NgIf, NgFor],
  templateUrl: './user-finder.component.html',
  styleUrl: './user-finder.component.scss'
})
export class UserFinderComponent implements OnInit, AfterViewInit {
  users: KnownUserDataModel[] = [];
  declare filteredUsers: string[];
  selectedUsers: KnownUserDataModel[] = [];
  @Output() closeFinder = new EventEmitter<void>();
  public csm: ColorSettingsModel;

  constructor(
    private groupSettingsService: GroupSettingsService,
    private usrCtrl: UserControlService,
    private colorManager: ColorManagerService,
    private el: ElementRef
  ) {
    this.csm = this.colorManager.csm;
  }

  search(query: Event): void {
    const input = query.target as HTMLInputElement;
    //const safeQuery = input.value.trim().toLowerCase();
    this.filteredUsers = this.users.map(user =>
      user.name.toLowerCase().includes(input.value.trim().toLowerCase()) ? user.name : ''
    );
  }

  ngOnInit(): void {
    this.usrCtrl.getKnownUsers().subscribe({
      next: (data: KnownUserDataModel[]) => {
        this.users = data;
        this.filteredUsers = data.map(user => user.name);
      },
      error: (error) => {
        console.error('Error fetching known users:', error);
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.csm) return;
    const root = this.el.nativeElement ?? document.querySelector('app-user-finder') ?? document.documentElement;
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
    setVar('--gradient-btn-hover-bg', csm.gradientButtonHover?.toLinearGradientString(135) ?? '');
    setVar('--gradient-btn-disabled-bg', csm.gradientButtonDisabled?.toLinearGradientString(135) ?? '');
    setVar('--close-btn-bg', csm.closeButtonBackground.toRgbaString());
    setVar('--close-btn-hover-bg', csm.closeButtonBackgroundHover.toRgbaString());
    setVar('--close-btn-icon', csm.closeButtonIcon.toRgbaString());
    setVar('--selected-user-bg', csm.cardBackground.toRgbaString());
    setVar('--selected-user-text', csm.primaryText.toRgbaString());
    setVar('--selected-user-remove-bg', csm.deleteGradientButton.toLinearGradientString(135));
    setVar('--selected-user-remove-hover-bg', csm.deleteGradientButtonHover.toLinearGradientString(135));
    setVar('--input-bg', csm.inputBackground.toRgbaString());
    setVar('--input-border', csm.inputBorder.toRgbaString());
    setVar('--input-focus-border', csm.inputBorderFocus.toRgbaString());
    setVar('--input-text', csm.inputText.toRgbaString());
    setVar('--input-placeholder', csm.inputPlaceholder.toRgbaString());
    setVar('--user-list-bg', csm.cardBackground.toRgbaString());
    setVar('--user-list-border', csm.listBorder.toRgbaString());
    setVar('--user-list-divider', csm.listDivider.toRgbaString());
    setVar('--user-list-hover-bg', csm.highlightBackground.toRgbaString());
    setVar('--selected-label', csm.secondaryText.toRgbaString());
    setVar('--no-selected-label', csm.mutedText.toRgbaString());
  }

  addUser(user: string): void {
    if (!this.selectedUsers.map(u => u.name).includes(user)) {
      const userData = this.users.find(u => u.name === user);
      this.selectedUsers.push(userData!);
    }
  }

  removeUser(user: KnownUserDataModel): void {
    this.selectedUsers = this.selectedUsers.filter(selected => selected.userId !== user.userId);
  }

  getInitials(user: KnownUserDataModel): string {
    const parts = user.name.split(' ');
    if (parts.length < 2) {
      return parts[0]?.charAt(0).toUpperCase();
    }
    const firstNameInitial = parts[0]?.charAt(0).toUpperCase() || '';
    const lastNameInitials = ' ' + parts[1]?.slice(0, 2).toUpperCase() || '';
    return firstNameInitial + lastNameInitials;
  }

  submitUsers(): void {
    this.groupSettingsService.setSelectedUsers(this.selectedUsers);
    this.closeFinder.emit(); // Notify parent to close the user-finder
  }
}
