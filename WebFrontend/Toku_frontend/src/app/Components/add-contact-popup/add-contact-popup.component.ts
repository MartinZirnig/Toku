import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfilePictureCircledComponent } from '../profile-picture-circled/profile-picture-circled.component';
import { KnownUserDataModel } from '../../data_managements/models/known-user-data-model';
import { NgFor, NgIf } from '@angular/common';

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

  // Statické záznamy pro fallback, pokud není předán žádný seznam
  staticUsers: KnownUserDataModel[] = [
    { userId: 1, name: 'Alice Example' },
    { userId: 2, name: 'Bob Demo' },
    { userId: 3, name: 'Charlie Test' },
    { userId: 4, name: 'Diana Sample' },
    { userId: 5, name: 'Eve Static' }
  ];

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
