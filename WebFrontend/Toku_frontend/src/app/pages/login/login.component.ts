import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Redirecter } from '../../data_managements/redirecter.service';
import { UserControlService } from '../../data_managements/control-services/user-control-service.service';
import { Observable } from 'rxjs';
import { UserLoginResponseModel } from '../../data_managements/models/user-login-response-model';
import { User } from '../../data_managements/user';
import { GoogleAuthenticationService } from '../../data_managements/services/google-authentication-service.service';
import { Heart } from '../../data_managements/heart.service';
import { IconComponent } from '../../Components/icon/icon.component';
import { MessagerService } from '../../data_managements/messager.service';
import { UserService } from '../../data_managements/services/user.service';
import { GroupService } from '../../data_managements/services/group-service.service';
import { ColorTestServiceService } from '../../test_services/color-test-service.service';
import { ColorManagerService } from '../../services/color-manager.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IconComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private redirecter: Redirecter,
    private usrCtrl: UserControlService,
    private googleAut: GoogleAuthenticationService,
    private heart: Heart,
    private messager: MessagerService,
    private userService: UserService,
    private groupService: GroupService,
    private colorTest: ColorTestServiceService,
    private route: ActivatedRoute,
    private colorManager: ColorManagerService
  ) {
    this.loginForm = this.fb.group({
      name: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

private clearNg(): void {
  const code = "ng_refresh_request";
  const value = localStorage.getItem(code);

  if (!value) {
    localStorage.setItem(code, '1');
    window.location.reload();
  } else {
    localStorage.removeItem(code);
  }
}

  ngOnInit(){
    this.clearNg();

    window.history.pushState({}, '', '/login');

    this.route.queryParams.subscribe(params => {
      const name: string | undefined = params['name'];
      const pass: string | undefined = params['pass'];
      const login: string | undefined = params['login'] ?? 'false';

      if (name) this.loginForm.patchValue({ name: name });
      if (pass) this.loginForm.patchValue({ password: pass });
      if (login === 'true') this.onLogin();
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
            User.InnerId = String(response.userId);
            this.loadUserData();
            this.redirecter.Group(response.lastGroupId);
            this.heart.startBeat();
            this.messager.openSocket();
            this.colorManager.load();

            this.markAsReceived();
          }
          else {
            this.printError('cannot login user, user data is not valid');
            console.error("error in user loading: No response");
          }
      },
      error: err => {
        console.error("error in user loading: ", err);
        this.printError('cannot login user, user data is not valid');
      }

    })
  }
  private loadUserData() {
    const request = this.usrCtrl.getUserData();
    request.subscribe({
      next: response => {
        User.Data = response;
        this.userService.getSwipes().subscribe({
          next: response => {
            User.LeftSwipe = response.left;
            User.RightSwipe = response.right;
          },
          error: err => {
            console.log("Error in swipes loading: ", err)
          }
        })
      },
      error: err => {
        this.printError('cannot load user data');
      }
    })
  }

  
  loginWithGoogle() {
    this.googleAut.login(this.manageLoginResponse);
  }

  markAsReceived() {
    this.groupService.receiveMessages().subscribe({
      next: response => {
        if (!response.success){
          console.error("error while receiving messages: ", response.description);
        }
      },
      error: err => {
        console.error("error while receiving messages: ", err);
      }
    })
  }
}