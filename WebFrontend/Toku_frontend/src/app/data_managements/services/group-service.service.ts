import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MessageModel } from './../models/message-model';
import { StoredMessageModel } from './../models/stored-message-model';
import { Server } from '../server';
import { AvailableGroupsModel } from '../models/available-groups-model';
import { RequestResultModel } from '../models/result-model';
import { UserGroupModel } from '../models/last-group-model';
import { MessageEditModel } from '../models/message-edit-model';
import { MessageRemoveModel } from '../models/message-remove-model';

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

  sendMessage(message: MessageModel): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/send-message`, message);
  }

  getMessages(identification: string, groupId: number, count: number | null = null): Observable<Array<StoredMessageModel>> {
    const params = new HttpParams()
      .set('identification', identification)
      .set('groupId', groupId.toString());
      if (count) params
        .set('count', count.toString());

    return this.http.get<StoredMessageModel[]>(`${this.baseUrl}/get-messages`, { params });
  }
  
  getMessage(id: number): Observable<StoredMessageModel> {
    const params = new HttpParams()
      .set('messageId', id);
      return this.http.get<StoredMessageModel>(`${this.baseUrl}/get-message`, { params });
  }

  readGroup(model: UserGroupModel) : Observable<RequestResultModel> {
    return this.http.patch<RequestResultModel>(`${this.baseUrl}/read-group`, model)
  }

  updateMessage(model: MessageEditModel) : Observable<RequestResultModel> {
    return this.http.patch<RequestResultModel>(`${this.baseUrl}/update-message`, model);
  }

  removeMessage(model: MessageRemoveModel) : Observable<RequestResultModel> {
    const params = new HttpParams()
      .set('userContext', model.userContext)
      .set('messageId', model.messageId);

    return this.http.delete<RequestResultModel>(`${this.baseUrl}/remove-message`, {params})
  }
}
