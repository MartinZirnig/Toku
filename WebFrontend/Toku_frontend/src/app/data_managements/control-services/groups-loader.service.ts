import { Injectable } from '@angular/core';
import { GroupService } from '../services/group-service.service';
import { Observable } from 'rxjs';
import { AvailableGroupsModel } from '../models/available-groups-model';
import { UserGroupModel } from '../models/last-group-model';
import { User } from '../user';
import { RequestResultModel } from '../models/result-model';

@Injectable({
  providedIn: 'root'
})
export class GroupsLoaderService {

  constructor(
    private service: GroupService
  ) { }
  public getGroups(): Observable<[AvailableGroupsModel]>{
    return this.service.loadGroups();
  }
  public updateLastGroup(groupId: number): Observable<RequestResultModel> {
    const model = new UserGroupModel(
      User.Id ?? '', groupId
    );
    return this.service.updateLastGroup(model);
  }
  public readGroup(groupId: number): Observable<RequestResultModel> {
    const model = new UserGroupModel(
      User.Id ?? '', groupId
    );
    return this.service.readGroup(model);
  }
}
