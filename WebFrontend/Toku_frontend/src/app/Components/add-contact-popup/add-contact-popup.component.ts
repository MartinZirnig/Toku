import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfilePictureCircledComponent } from '../profile-picture-circled/profile-picture-circled.component';
import { KnownUserDataModel } from '../../data_managements/models/known-user-data-model';
import { NgFor, NgIf } from '@angular/common';
import { ColorManagerService } from '../../services/color-manager.service';
import { ColorSettingsModel } from '../../data_managements/models/color-settings-model';

@Component({
  selector: 'app-add-contact-popup',
  standalone: true,
  imports: [FormsModule, ProfilePictureCircledComponent, NgFor, NgIf],
  templateUrl: './add-contact-popup.component.html',
  styleUrl: './add-contact-popup.component.scss'
})
export class AddContactPopupComponent {
  // Pokud nejsou předány, použij statické záznamy
  @Input() allUsers: KnownUserDataModel[] = [];
  @Input() existingContacts: KnownUserDataModel[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() addContact = new EventEmitter<KnownUserDataModel>();

  search: string = '';

  ngonInit() {
  alert('AddContactPopupComponent initialized');
  }
  // Statické záznamy pro fallback, pokud není předán žádný seznam
  staticUsers: KnownUserDataModel[] = [
    { userId: 1, name: 'Alice Example' },
    { userId: 2, name: 'Bob Demo' },
    { userId: 3, name: 'Charlie Test' },
    { userId: 4, name: 'Diana Sample' },
    { userId: 5, name: 'Eve Static' }
  ];

  public csm: ColorSettingsModel;

  constructor(private colorManager: ColorManagerService) {
    this.csm = colorManager.csm;
  }

  ngAfterViewInit() {
    setTimeout(() => this.applyColors(), 0);
  }

  private applyColors() {
    const popup = document.querySelector('.add-contact-popup') as HTMLElement;
    const overlay = document.querySelector('.popup-overlay') as HTMLElement;
    if (!popup || !this.csm) return;

    if (overlay) {
      overlay.style.setProperty('--overlay-bg', this.csm.overlayBackground.toRgbaString());
    }

    popup.style.setProperty('--popup-bg', this.csm.popupBackground.toRgbaString());
    popup.style.setProperty('--popup-border', this.csm.popupBorder.toRgbaString());
    popup.style.setProperty('--button-shadow', this.csm.buttonShadow.toRgbaString());
    popup.style.setProperty('--heading-text', this.csm.headingText.toRgbaString());
    popup.style.setProperty('--close-btn-bg', this.csm.closeButtonBackground.toRgbaString());
    popup.style.setProperty('--close-btn-bg-hover', this.csm.closeButtonBackgroundHover.toRgbaString());
    popup.style.setProperty('--close-btn-icon', this.csm.closeButtonIcon.toRgbaString());
    popup.style.setProperty('--input-bg', this.csm.inputBackground.toRgbaString());
    popup.style.setProperty('--input-bg-focus', this.csm.inputBackgroundFocus.toRgbaString());
    popup.style.setProperty('--input-text', this.csm.inputText.toRgbaString());
    popup.style.setProperty('--input-border', this.csm.inputBorder.toRgbaString());
    popup.style.setProperty('--input-border-focus', this.csm.inputBorderFocus.toRgbaString());
    popup.style.setProperty('--input-placeholder', this.csm.inputPlaceholder.toRgbaString());
    popup.style.setProperty('--list-bg', this.csm.listBackground.toRgbaString());
    popup.style.setProperty('--list-border', this.csm.listBorder.toRgbaString());
    popup.style.setProperty('--list-divider', this.csm.listDivider.toRgbaString());
    popup.style.setProperty('--highlight-bg', this.csm.highlightBackground.toRgbaString());
    popup.style.setProperty('--primary-text', this.csm.primaryText.toRgbaString());
    popup.style.setProperty('--secondary-text', this.csm.secondaryText.toRgbaString());
    popup.style.setProperty('--muted-text', this.csm.mutedText.toRgbaString());
    popup.style.setProperty('--gradient-btn-bg', this.csm.gradientButton.toLinearGradientString(135));
    popup.style.setProperty('--gradient-btn-bg-hover', this.csm.gradientButtonHover.toLinearGradientString(135));
    popup.style.setProperty('--button-text', this.csm.buttonText.toRgbaString());
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
    const q = (this.search || '').trim().toLowerCase();
    return this.staticUsers.filter(u =>
      (!q || (u.name && u.name.toLowerCase().includes(q))) &&
      !this.existingContacts.some(c => c.userId === u.userId)
    );
  }

  onAdd(user: KnownUserDataModel) {
    this.addContact.emit(user);
  }
}
