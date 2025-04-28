import { Injectable } from '@angular/core';
import { UserControlService } from '../control-services/user-control-service.service';
import { Observable } from 'rxjs';
import { UserLoginResponseModel } from '../models/user-login-response-model';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthenticationService {
  private clientId = '306705250294-nt8jg7u85r9a3s0lav3hh664jv96d73f.apps.googleusercontent.com';
  private callback?: (value: Observable<UserLoginResponseModel>) => void;


  constructor(
    private usrCtrl: UserControlService
  ) {
    this.initialize();
  }

  private initialize() {
    google.accounts.id.initialize({
      client_id: this.clientId,
      callback: this.finishGoogleLogin.bind(this),
    });
  }

  public login(tempCallback: (value: Observable<UserLoginResponseModel>) => void) {
    this.callback = tempCallback;
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        console.warn('Google login not displayed:', notification.getNotDisplayedReason());
      }
      if (notification.isSkippedMoment()) {
        console.warn('User skipped login:', notification.getSkippedReason());
      }
    });
  }

  private finishGoogleLogin(response: any) {
    const request = this.usrCtrl.gmailLogin(
      response.credential, response.select_by) 
      
    if (this.callback)
      this.callback(request);
  }
}
