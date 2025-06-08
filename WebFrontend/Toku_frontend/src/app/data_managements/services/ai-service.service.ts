import { HttpClient } from '@angular/common/http';
import { Injectable, Query } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestResultModel } from '../models/result-model';
import { Server } from '../server';
import { StoredMessageModel } from '../models/stored-message-model';
import { AiQueryModel } from '../models/ai-query-model';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private baseUrl: string = `${Server.Url}/ai` 
  constructor(
    private http: HttpClient
  ) { }

  public AskAi(query: AiQueryModel) : Observable<StoredMessageModel> {
    return this.http.post<StoredMessageModel>(`${this.baseUrl}/chat`, query);
  } 
  public RefreshAi() : Observable<RequestResultModel> {
    return this.http.delete<RequestResultModel>(`${this.baseUrl}/clean`);
  }
  public LoadChat() : Observable<StoredMessageModel[]> {
    return this.http.get<StoredMessageModel[]>(`${this.baseUrl}/get-history`);
  }
}