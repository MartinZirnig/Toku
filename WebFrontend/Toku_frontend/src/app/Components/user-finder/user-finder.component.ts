import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GroupSettingsService } from '../../services/group-settings.service';
import { KnownUserDataModel } from '../../data_managements/models/known-user-data-model';
import { UserControlService } from '../../data_managements/control-services/user-control-service.service';

@Component({
  selector: 'app-user-finder',
  imports: [NgIf, NgFor],
  templateUrl: './user-finder.component.html',
  styleUrl: './user-finder.component.scss'
})
export class UserFinderComponent implements OnInit {
  users: KnownUserDataModel[] = [];
  declare filteredUsers: string[];
  selectedUsers: KnownUserDataModel[] = [];
  @Output() closeFinder = new EventEmitter<void>();

  constructor(
    private groupSettingsService: GroupSettingsService,
    private usrCtrl: UserControlService
  ) {}

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
