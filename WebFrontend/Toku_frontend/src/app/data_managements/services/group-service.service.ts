import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MessageModel } from './../models/message-model';
import { StoredMessageModel } from './../models/stored-message-model';
import { Server } from '../server';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  private readonly baseUrl: string = Server.Url + "/group"; 

  constructor(private http: HttpClient) {}

  sendMessage(message: MessageModel): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/SendMessage`, message);
  }

  getMessages(identification: string, groupId: number, count: number): Observable<StoredMessageModel[]> {
    const params = new HttpParams()
      .set('identification', identification)
      .set('groupId', groupId.toString())
      .set('count', count.toString());

    return this.http.get<StoredMessageModel[]>(`${this.baseUrl}/GetMessages`, { params });
  }
}
