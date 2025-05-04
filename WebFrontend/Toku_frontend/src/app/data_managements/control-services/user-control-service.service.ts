import { Injectable } from '@angular/core';
import { RegisterService } from '../services/register-service.service';
import { LoginService } from '../services/login-service.service';
import { Observable, take } from 'rxjs';
import { UserRegistrationModel } from '../models/user-registration-model';
import { UserLoginModel } from './../models/user-login-model';
import { UserLoginResponseModel } from '../models/user-login-response-model';
import { RequestResultModel } from '../models/result-model';
import { GmailAuthorizationModel } from '../models/gmail-authorization-model';
import { UserService } from '../services/user.service';
import { UserDataModel } from '../models/user-data-model';
import { User } from '../user';
import { KnownUserDataModel } from '../models/known-user-data-model';
import { GroupUserAccessModel } from '../models/group-user-access-model';

@Injectable({
  providedIn: 'root'
})
export class UserControlService {
  constructor(
    private registerService: RegisterService,
    private loginService: LoginService,
    private userService: UserService,
  ) { }

  
  public register(name: string, email: string, password: string) : Observable<RequestResultModel> {
    const model = new UserRegistrationModel(
      name, email, password, this.GetTimeZone()
    );
    return this.registerService.registerUser(model);
  }
  public login(name: string, password: string): Observable<UserLoginResponseModel> {
    const model = new UserLoginModel(
      name, password, this.GetTimeZone()
    );
    
    return this.loginService.login(model);
  }
  public gmailLogin(
    credentials: string, selected_by: string ) {
    const model = new GmailAuthorizationModel(
      credentials, selected_by, this.GetTimeZone()
    );
    return this.loginService.gmailLogin(model);
  }
  public logout(): Observable<RequestResultModel> {
    return this.loginService.logout();
  } 

  public getUserData(): Observable<UserDataModel> {
    return this.userService.getUserData();
  }
  public updateUserData(name: string, email: string, phone: string )
    : Observable<RequestResultModel> {
    const model = new UserDataModel(
      name, email, phone, User.Active);

    return this.userService.updateUserData(model);
  }
  public getKnownUsers(): Observable<KnownUserDataModel[]> {
    return this.userService.getKnownUsers();
  }


  private GetTimeZone(): number {
    var time = new Date().getTimezoneOffset();
    console.log("TimeZone: " + time);
    return time;
  }
}
