import { Pipe, PipeTransform } from '@angular/core';
import { KnownUserDataModel } from '../../data_managements/models/known-user-data-model';

@Pipe({
  name: 'userNameFilter',
  standalone: true
})
export class UserNameFilterPipe implements PipeTransform {
  transform(users: KnownUserDataModel[], search: string, existingContacts: KnownUserDataModel[]): KnownUserDataModel[] {
    const q = (search || '').trim().toLowerCase();
    return users.filter(u =>
      (!q || (u.name && u.name.toLowerCase().includes(q))) &&
      !existingContacts.some(c => c.userId === u.userId)
    );
  }
}
