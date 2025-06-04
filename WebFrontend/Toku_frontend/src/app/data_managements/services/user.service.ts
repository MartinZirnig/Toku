import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserDataModel } from '../models/user-data-model';
import { RequestResultModel } from '../models/result-model';
import { User } from '../user';
import { Server } from '../server';
import { KnownUserDataModel } from '../models/known-user-data-model';
import { UserPermissionModel } from '../models/user-permission-model';

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
}
