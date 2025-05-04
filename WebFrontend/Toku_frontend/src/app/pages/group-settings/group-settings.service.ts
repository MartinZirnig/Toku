import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KnownUserDataModel } from '../../data_managements/models/known-user-data-model';

@Injectable({
  providedIn: 'root',
})
export class GroupSettingsService {
  private selectedUsersSubject = new BehaviorSubject<KnownUserDataModel[]>([]);
  selectedUsers$ = this.selectedUsersSubject.asObservable();

  setSelectedUsers(users: KnownUserDataModel[]): void {
    this.selectedUsersSubject.next(users);
  }
}
