import { Injectable } from '@angular/core';
import { Server } from '../server';
import { HttpClient } from '@angular/common/http';
import { MessageModel } from '../models/message-model';
import { StoredMessageModel } from '../models/stored-message-model';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { RequestResultModel } from '../models/result-model';
import { MessageEditModel } from '../models/message-edit-model';
import { MessageRemoveModel } from '../models/message-remove-model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly baseUrl: string = Server.Url + "/message"; 

  constructor(
    private http: HttpClient
  ) {}

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
