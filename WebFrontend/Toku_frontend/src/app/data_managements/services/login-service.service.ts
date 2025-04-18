import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserLoginModel } from './../models/user-login-model';
import { Server } from '../server';
import { UserLoginResponseModel } from '../models/user-login-response-model';
import { RequestResultModel } from '../models/result-model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private readonly baseUrl: string = Server.Url + '/login';

  constructor(private http: HttpClient) {}

  login(user: UserLoginModel): Observable<UserLoginResponseModel> {
    return this.http.post<UserLoginResponseModel>(`${this.baseUrl}/login`, user);
  }

  logout(): Observable<RequestResultModel> {
    return this.http.post<RequestResultModel>(`${this.baseUrl}/logout`, null);
  }
}