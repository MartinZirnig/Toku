import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { GroupSettingsService } from '../group-settings.service';

@Component({
  selector: 'app-user-finder',
  imports: [NgIf, NgFor],
  templateUrl: './user-finder.component.html',
  styleUrl: './user-finder.component.scss'
})
export class UserFinderComponent {
  users = ['Alice zdepa', 'Bob', 'Chafghfrlie', 'Algfhfghice', 'fghfghBob', 'Charlffffie', 'Davigd', 'Eveg','Davgggid', 'Evgggfe'];
  filteredUsers = [...this.users];
  selectedUsers: string[] = [];
  @Output() closeFinder = new EventEmitter<void>();

  constructor(private groupSettingsService: GroupSettingsService) {}

  search(query: Event): void {
    const input = query.target as HTMLInputElement;
    const safeQuery = input.value.trim().toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.toLowerCase().includes(safeQuery)
    );
  }

  addUser(user: string): void {
    if (!this.selectedUsers.includes(user)) {
      this.selectedUsers.push(user);
    }
  }

  removeUser(user: string): void {
    this.selectedUsers = this.selectedUsers.filter(selected => selected !== user);
  }

  getInitials(user: string): string {
    const parts = user.split(' ');
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
