import { HttpClient } from '@angular/common/http';
import { Injectable, Query } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestResultModel } from '../models/result-model';
import { Server } from '../server';

@Injectable({
  providedIn: 'root'
})
export class AiServiceService {
  private baseUrl: string = `${Server.Url}/ai` 
  constructor(
    private http: HttpClient
  ) { }

  public AskAi(query: string) : Observable<RequestResultModel> {
    return this.http.post<RequestResultModel>(`${this.baseUrl}/get-response`, query)
  } 
  public RefreshAi() : Observable<RequestResultModel> {
    return this.http.delete<RequestResultModel>(`${this.baseUrl}/clean`);
  }
}