import { Injectable } from '@angular/core';
import { GroupService } from '../services/group-service.service';
import { Observable, ObservableNotification } from 'rxjs';
import { AvailableGroupsModel } from '../models/available-groups-model';
import { UserGroupModel } from '../models/last-group-model';
import { User } from '../user';
import { RequestResultModel } from '../models/result-model';
import { GroupUserAccessModel } from '../models/group-user-access-model';
import { GroupDataModel } from '../models/group-data-model';

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
  public loadMembers(roomId: number): Observable<GroupUserAccessModel[]>{
    return this.service.loadMembers(roomId);
  }
  public loadData(roomId: number) : Observable<GroupDataModel>{
    return this.service.getData(roomId);
  }
  public getLog(groupId: number) : Observable<RequestResultModel> {
    return this.service.getLog(groupId);
  }
}
