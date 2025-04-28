import { Injectable } from '@angular/core';
import { RegisterService } from '../services/register-service.service';
import { LoginService } from '../services/login-service.service';
import { User } from '../user';
import { Heart } from '../heart.service';
import { Observable, take } from 'rxjs';
import { UserRegistrationModel } from '../models/user-registration-model';
import { UserLoginModel } from './../models/user-login-model';
import { Redirecter } from './../redirecter.service'
import { UserLoginResponseModel } from '../models/user-login-response-model';
import { RequestResultModel } from '../models/result-model';
import { GmailAuthorizationModel } from '../models/gmail-authorization-model';

@Injectable({
  providedIn: 'root'
})
export class UserControlService {
  constructor(
    private registerService: RegisterService,
    private loginService: LoginService,
    private heart: Heart,
    private redirecter: Redirecter
  ) { }

  
  public register(name: string, email: string, password: string) : Observable<RequestResultModel> {
    const model = new UserRegistrationModel(
      name, email, password
    );
    return this.registerService.registerUser(model);
  }
  public login(name: string, password: string): Observable<UserLoginResponseModel> {
    const model = new UserLoginModel(
      name, password
    );
    
    return this.loginService.login(model);
  }
  public gmailLogin(
    credentials: string, selected_by: string ) {
    const model = new GmailAuthorizationModel(
      credentials, selected_by
    );
    return this.loginService.gmailLogin(model);
  }
  public logout(): Observable<RequestResultModel> {
    return this.loginService.logout();
  } 


}
