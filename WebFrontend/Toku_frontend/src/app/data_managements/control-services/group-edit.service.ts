import { Injectable } from '@angular/core';
import { GroupService } from '../services/group-service.service';
import { Observable } from 'rxjs';
import { RequestResultModel } from '../models/result-model';
import { GroupCreationModel } from '../models/group-creation-model';
import { User } from '../user';
import { GroupAddUserModel } from '../models/group-add-user-model';
import { GroupUserAccessModel } from '../models/group-user-access-model';
import { GroupUpdateModel } from '../models/group-update-model';

@Injectable({
  providedIn: 'root'
})
export class GroupEditService {

  constructor(
    private grpCtrl: GroupService
  ) { }

  createGroup(name: string, description: string, groupType: number, password: string): Observable<RequestResultModel> {
    const model = new GroupCreationModel(
      User.Id ?? '', name, description, groupType, password
    )
  
    return this.grpCtrl.createGroup(model);
  }

  updateGroup(
    groupId: number, name: string, description: string, groupType: number, password: string): Observable<RequestResultModel> {
    const model = new GroupUpdateModel(
      name, description, groupType, password, groupId
    )
    return this.grpCtrl.update(model);
    }


  addGroupMember(groupId: number, userId: number): Observable<RequestResultModel> {
    const model = new GroupAddUserModel(
      userId, groupId, 0
    )
    
    return this.grpCtrl.addUserGroup(model);
  }  

  setUserAccess(groupId: number, userId: number, permissions: number[]): Observable<RequestResultModel> {
    const model = new GroupUserAccessModel(
      userId, groupId, permissions
    )
    
    return this.grpCtrl.setUserAccess(model);
  }
}
