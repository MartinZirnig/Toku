import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { ColorSettingsModel } from "../models/color-settings-model";
import { IgnoredMessagesModel } from '../models/ignored-messages-model';
import { HttpClient } from '@angular/common/http';
import { Server } from '../server';
import { RequestResultModel } from '../models/result-model';
@Injectable({
  providedIn: 'root'
})
export class SettingsManagerService {
  private baseUrl = `${Server.Url}/customized`;
  
  constructor(
    private http : HttpClient
  ) {}

  public GetColors() : Observable<ColorSettingsModel> {
    return this.http.get<ColorSettingsModel>(`${this.baseUrl}/get-colors`);
  }
  public GetIgnoredMessages() : Observable<IgnoredMessagesModel> {
    return this.http.get<ColorSettingsModel>(`${this.baseUrl}/get-ignored`);
  }
  
  public SetColors(model: ColorSettingsModel) : Observable<RequestResultModel> {
    return this.http.patch<RequestResultModel>(`${this.baseUrl}/set-colors`, model);
  }
  public AppendIgnored(id: number) : Observable<RequestResultModel> {
    return this.http.patch<RequestResultModel>(`${this.baseUrl}/set-ignored/${id}`, null);
  }
}