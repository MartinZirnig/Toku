import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupSettingsService {
  private selectedUsersSubject = new BehaviorSubject<string[]>([]);
  selectedUsers$ = this.selectedUsersSubject.asObservable();

  setSelectedUsers(users: string[]): void {
    this.selectedUsersSubject.next(users);
  }
}
