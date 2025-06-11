import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserDataModel } from '../models/user-data-model';
import { RequestResultModel } from '../models/result-model';
import { User } from '../user';
import { Server } from '../server';
import { KnownUserDataModel } from '../models/known-user-data-model';
import { UserPermissionModel } from '../models/user-permission-model';
import { ContactEditModel } from '../models/contact-edit-model';
import { SwipeAction } from '../../pages/user-settings/user-settings.component';
import { SwipeInfoModel } from '../models/swipe-info-model';
import { ColorSettingsModel } from '../models/color-settings-model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly url: string = Server.Url + "/user"; 

  constructor(
    private http: HttpClient
  ) { }

  getUserData(): Observable<UserDataModel> {
    const path: string = this.url + "/get"; 
    return this.http.get<UserDataModel>(path);
  }
  updateUserData(userData: UserDataModel): Observable<RequestResultModel> {
    const path: string = this.url + "/update"; 
    return this.http.patch<RequestResultModel>(path, userData);
  }
  public getKnownUsers(): Observable<KnownUserDataModel[]> {
    const path: string = this.url + "/get-known-users"; 
    return this.http.get<KnownUserDataModel[]>(path);
  }
  public getAvailablePermissions() : Observable<UserPermissionModel[]> {
    const path = `${this.url}/get-acces-options`;
    return this.http.get<UserPermissionModel[]>(path);
  }
  public setPicture(file: Number): Observable<RequestResultModel> {
    const path: string = this.url + "/set-picture"; 

    let param = new HttpParams();
    param = param.append("file", file.toString());

    return this.http.put<RequestResultModel>(path, null, {params: param});
  }
  public getPicture(userId: Number): Observable<RequestResultModel> {
    const path: string = this.url + "/get-profile"; 

    let param = new HttpParams();
    param = param.append("userId", userId.toString());

    return this.http.get<RequestResultModel>(path, {params: param});
  }

  public searchUsers(search: string): Observable<KnownUserDataModel[]> {
    const path: string = this.url + "/search-user";  
    let param = new HttpParams();
    param = param.append("query", search);

    return this.http.get<KnownUserDataModel[]>(path, {params: param})
  }

  public updateContact(model: ContactEditModel) : Observable<RequestResultModel> {
    const path: string = this.url + "/update-contact";  

    return this.http.patch<RequestResultModel>(path, model);
  }

  public setSwipes(model: SwipeInfoModel) : Observable<RequestResultModel> {
    const path: string = this.url + "/set-swipes";  
    
    return this.http.patch<RequestResultModel>(path, model)
  }
  public getSwipes() : Observable<SwipeInfoModel> {
    const path: string = this.url + "/get-swipes";  

    return this.http.get<SwipeInfoModel>(path);
  }

  public deleteUser() : Observable<RequestResultModel> {
    const path: string = this.url + "/delete";  
    
    return this.http.delete<RequestResultModel>(path);
  }

  public getColorSettings() : Observable<ColorSettingsModel> {
    const path: string = this.url + "/get-colors";
    
    return this.http.get<ColorSettingsModel>(path);
  }
  public setColorSettings(model: ColorSettingsModel) : Observable<RequestResultModel> {
    const path: string = this.url + "/update-colors";
    
    return this.http.patch<RequestResultModel>(path, model);
  }
}
