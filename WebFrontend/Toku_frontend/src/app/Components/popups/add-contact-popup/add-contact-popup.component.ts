import { Component, EventEmitter, Input, OnInit, Output, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfilePictureCircledComponent } from '../../profile-picture-circled/profile-picture-circled.component';
import { KnownUserDataModel } from '../../../data_managements/models/known-user-data-model';
import { NgFor, NgIf } from '@angular/common';
import { ColorManagerService } from '../../../services/color-manager.service';
import { ColorSettingsModel } from '../../../data_managements/models/color-settings-model';
import { UserService } from '../../../data_managements/services/user.service';

@Component({
  selector: 'app-add-contact-popup',
  standalone: true,
  imports: [FormsModule, ProfilePictureCircledComponent, NgFor, NgIf],
  templateUrl: './add-contact-popup.component.html',
  styleUrl: './add-contact-popup.component.scss'
})
export class AddContactPopupComponent implements OnInit {
  // Pokud nejsou předány, použij statické záznamy
  @Input() allUsers: KnownUserDataModel[] = [];
  @Input() existingContacts: KnownUserDataModel[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() addContact = new EventEmitter<KnownUserDataModel>();

  search: string = '';
  usrs: KnownUserDataModel[] = [];

  // Statické záznamy pro fallback, pokud není předán žádný seznam
  staticUsers: KnownUserDataModel[] = [
    /*
    { userId: 1, name: 'Alice Example' },
    { userId: 2, name: 'Bob Demo' },
    { userId: 3, name: 'Charlie Test' },
    { userId: 4, name: 'Diana Sample' },
    { userId: 5, name: 'Eve Static' }
    */
    ];

  public csm: ColorSettingsModel;

  constructor(
    private colorManager: ColorManagerService,
    private userService: UserService,
    private el: ElementRef
  ) {
    this.csm = colorManager.csm;
  }
  ngOnInit(): void {
    this.seach();
  }

  ngAfterViewInit() {
    if (!this.csm || !this.csm.overlayBackground) return;

    const root = this.el.nativeElement ?? document.querySelector('app-add-contact-popup') ?? document.documentElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    const csm = this.csm;

    setVar('--overlay-bg', csm.overlayBackground.toRgbaString());
    setVar('--popup-bg', csm.popupBackground.toRgbaString());
    setVar('--popup-border', csm.popupBorder.toRgbaString());
    setVar('--button-shadow', csm.buttonShadow.toRgbaString());
    setVar('--heading-text', csm.headingText.toRgbaString());
    setVar('--close-btn-bg', csm.closeButtonBackground.toRgbaString());
    setVar('--close-btn-bg-hover', csm.closeButtonBackgroundHover.toRgbaString());
    setVar('--close-btn-icon', csm.closeButtonIcon.toRgbaString());
    setVar('--input-bg', csm.inputBackground.toRgbaString());
    setVar('--input-bg-focus', csm.inputBackgroundFocus.toRgbaString());
    setVar('--input-text', csm.inputText.toRgbaString());
    setVar('--input-border', csm.inputBorder.toRgbaString());
    setVar('--input-border-focus', csm.inputBorderFocus.toRgbaString());
    setVar('--input-placeholder', csm.inputPlaceholder.toRgbaString());
    setVar('--list-bg', csm.listBackground.toRgbaString());
    setVar('--list-border', csm.listBorder.toRgbaString());
    setVar('--list-divider', csm.listDivider.toRgbaString());
    setVar('--highlight-bg', csm.highlightBackground.toRgbaString());
    setVar('--primary-text', csm.primaryText.toRgbaString());
    setVar('--secondary-text', csm.secondaryText.toRgbaString());
    setVar('--muted-text', csm.mutedText.toRgbaString());
    setVar('--gradient-btn-bg', csm.gradientButton.toLinearGradientString(135));
    setVar('--gradient-btn-bg-hover', csm.gradientButtonHover.toLinearGradientString(135));
    setVar('--button-text', csm.buttonText.toRgbaString());
  }

  get filteredUsers(): KnownUserDataModel[] {
    // Pokud není předán žádný seznam, použij statické záznamy
    const users = (this.allUsers && this.allUsers.length > 0) ? this.allUsers : this.staticUsers;
    const q = this.search.trim().toLowerCase();
    return users
      .filter(u =>
        (!q || (u.name && u.name.toLowerCase().includes(q))) &&
        !this.existingContacts.some(c => c.userId === u.userId)
      );
  }

  get filteredStaticUsers(): KnownUserDataModel[] {
    /*
    const q = (this.search || '').trim().toLowerCase();
    return this.staticUsers.filter(u =>
      (!q || (u.name && u.name.toLowerCase().includes(q))) &&
      !this.existingContacts.some(c => c.userId === u.userId)
    );
    */
   return this.allUsers;
  }

  onAdd(user: KnownUserDataModel) {
    this.addContact.emit(user);
  }

  seach() {
    if (this.search.trim() === '') {
      this.userService.getKnownUsers().subscribe({
        next: users => {
          this.usrs = users;
        },
        error: (err) => {
          console.error('Error fetching known users:', err);
        }
      })
    } else {
      this.userService.searchUsers(this.search).subscribe({
        next: users => {
          this.usrs = users;
        },
        error: (err) => {
          console.error('Error searching users:', err);
        }
      });
    }
  }
}
