import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRegistrationModel } from './../models/user-registration-model';
import { Server } from '../server'; 
import { RequestResultModel } from '../models/result-model';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private readonly url: string = Server.Url + "/register/register"; 

  constructor(
    private http: HttpClient
  ) { }

registerUser(user: UserRegistrationModel): Observable<RequestResultModel> {
    const path: string = this.url; 
    return this.http.post<RequestResultModel>(path, user);
  }
}
