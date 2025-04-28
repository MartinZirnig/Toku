import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserLoginModel } from './../models/user-login-model';
import { Server } from '../server';
import { UserLoginResponseModel } from '../models/user-login-response-model';
import { RequestResultModel } from '../models/result-model';
import { GmailAuthorizationModel } from '../models/gmail-authorization-model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private readonly baseUrl: string = Server.Url + '/login';

  constructor(private http: HttpClient) {}

  public login(user: UserLoginModel): Observable<UserLoginResponseModel> {
    return this.http.post<UserLoginResponseModel>(`${this.baseUrl}/login`, user);
  }
  
  public gmailLogin(model: GmailAuthorizationModel): Observable<UserLoginResponseModel> {
    return this.http.post<UserLoginResponseModel>(`${this.baseUrl}/login-google`, model)
  }

  public logout(): Observable<RequestResultModel> {
    return this.http.post<RequestResultModel>(`${this.baseUrl}/logout`, null);
  }
}