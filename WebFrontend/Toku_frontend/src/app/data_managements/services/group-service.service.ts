import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Server } from '../server';
import { AvailableGroupsModel } from '../models/available-groups-model';
import { RequestResultModel } from '../models/result-model';
import { UserGroupModel } from '../models/last-group-model';
import { MessageEditModel } from '../models/message-edit-model';
import { MessageRemoveModel } from '../models/message-remove-model';
import { GroupCreationModel } from '../models/group-creation-model';
import { GroupAddUserModel } from '../models/group-add-user-model';
import { GroupUserAccessModel } from '../models/group-user-access-model';
import { GroupUpdateModel } from '../models/group-update-model';
import { GroupDataModel } from '../models/group-data-model';
import { GroupRemoveUserModel } from '../models/group-remove-user-model';
import { GroupPictureModel } from '../models/group-picture-model';
import { GroupJoinModel } from '../models/group-join-model';
import { PublicGroupInfoModel } from '../models/public-group-info-model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  private readonly baseUrl: string = Server.Url + "/group"; 

  constructor(private http: HttpClient) {}

  loadGroups() : Observable<[AvailableGroupsModel]> {
    return this.http.get<[AvailableGroupsModel]>(`${this.baseUrl}/get-user-groups`)
  }

  updateLastGroup(model: UserGroupModel) : Observable<RequestResultModel> {
    return this.http.patch<RequestResultModel>(`${this.baseUrl}/update-last-group`, model)
  }

  readGroup(model: UserGroupModel) : Observable<RequestResultModel> {
    return this.http.patch<RequestResultModel>(`${this.baseUrl}/read-group`, model)
  }


  createGroup(model: GroupCreationModel) : Observable<RequestResultModel> {
    return this.http.post<RequestResultModel>(`${this.baseUrl}/create`, model)
  }
  update(model: GroupUpdateModel) : Observable<RequestResultModel> {
    return this.http.patch<RequestResultModel>(`${this.baseUrl}/update`, model)
  }
  addUserGroup(model: GroupAddUserModel) : Observable<RequestResultModel> {
    return this.http.post<RequestResultModel>(`${this.baseUrl}/add-user`, model)
  }
  setUserAccess(model: GroupUserAccessModel) : Observable<RequestResultModel> {
    return this.http.patch<RequestResultModel>(`${this.baseUrl}/update-access`, model)
  }
  loadMembers(roomId: number) : Observable<GroupUserAccessModel[]>{
    const params = new HttpParams()
    .set('groupId', roomId)
    return this.http.get<GroupUserAccessModel[]>(`${this.baseUrl}/get-members`, {params})
  }
  getData(roomId: number): Observable<GroupDataModel>{
    const params = new HttpParams()
    .set('groupId', roomId)
    return this.http.get<GroupDataModel>(`${this.baseUrl}/get-data`, {params})
  }
  removeUser(model: GroupRemoveUserModel) : Observable<RequestResultModel> {
    const url = `${this.baseUrl}/remove-user`;

    const params = new HttpParams({
      fromObject: {
        executorContext: model.executorContext,
        targetUser: model.targetUser,
        targetGroup: model.targetGroup
    }});

    return this.http.delete<RequestResultModel>(url, { params: params });
  }
  getLog(groupId: number) : Observable<RequestResultModel> {
    const path = `${this.baseUrl}/get-log`
    const params = new HttpParams({
      fromObject: {
       groupId: groupId
    }});
    return this.http.get<RequestResultModel>(path, {params: params});
  }

  getPicture(groupId: number) : Observable<RequestResultModel> {
    const path = `${this.baseUrl}/get-picture`
    const params = new HttpParams({
      fromObject: {
       groupId: groupId
    }});
    return this.http.get<RequestResultModel>(path, {params: params});
  }
  setPicture(groupId: number, fileId: number) : Observable<RequestResultModel> {
    var model = new GroupPictureModel(fileId, groupId);

    return this.http.patch<RequestResultModel>(`${this.baseUrl}/set-picture`, model);
  }

  joinGroup(groupId: number, groupName: string, password?: string): Observable<RequestResultModel> {
    const model = new GroupJoinModel(groupId, groupName, password);

    return this.http.post<RequestResultModel>(`${this.baseUrl}/join`, model);
  }
  getPublicGroups(): Observable<PublicGroupInfoModel[]> {
    return this.http.get<PublicGroupInfoModel[]>(`${this.baseUrl}/get-public-groups`);
  }
}
