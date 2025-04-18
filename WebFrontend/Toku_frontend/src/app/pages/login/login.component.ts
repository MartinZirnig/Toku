import { Component, importProvidersFrom } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BackgroundLoginComponent } from '../../Components/background-login/background-login.component';
import { Redirecter } from '../../data_managements/redirecter.service';
import { UserControlService } from '../../data_managements/control-services/user-control-service.service';
import { Observable } from 'rxjs';
import { UserLoginResponseModel } from '../../data_managements/models/user-login-response-model';
import { User } from '../../data_managements/user';
import { GoogleAuthenticationService } from '../../data_managements/services/google-authentication-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, BackgroundLoginComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private redirecter: Redirecter,
    private usrCtrl: UserControlService,
    private googleAut: GoogleAuthenticationService
  ) {
    this.loginForm = this.fb.group({
      name: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  printError(message: string) {
    this.errorMessage = message;
  }

  onLogin() {
    const {name, password} = this.loginForm.value;
    if (this.loginForm.invalid) {
      this.printError('Please fill in all fields.');
      return;
    }

    this.fynishLogin(name, password);
}

  private fynishLogin(name: string, password: string) : void {
    const request = this.usrCtrl.login(name, password);
    this.manageLoginResponse(request);
  }

  private manageLoginResponse(
    request: Observable<UserLoginResponseModel>): void {
    request.subscribe({
        next: response => {
          if (response.userIdentification.trim()) {
            User.Id = response.userIdentification;
            this.redirecter.Group(response.lastGroupId);
          }
          else 
            this.printError('cannot login user, user data is not valid');
      },
      error: err => {
        this.printError('cannot login user, user data is not valid');
      }

    })
  }

  
  loginWithGoogle() {
    this.googleAut.login(this.manageLoginResponse);
  }
}
