import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BackgroundLoginComponent } from '../../Components/background-login/background-login.component';
import { UserRegistrationModel } from '../../data_managements/models/user-registration-model';
import { Redirecter } from '../../data_managements/redirecter.service';
import { UserControlService } from '../../data_managements/control-services/user-control-service.service';
import { User } from '../../data_managements/user';
import { Heart } from '../../data_managements/heart.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, BackgroundLoginComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private redirecter: Redirecter,
    private usrctrl: UserControlService,
    private heart: Heart
  ) 
  {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  printError(message: string) {
    this.errorMessage = message;
  }

  onSubmit() {
    const { name, email, password, confirmPassword } = this.registerForm.value;

    if (this.registerForm.invalid) {
      this.printError('Please fill in all fields correctly.');
      return;
    }

    if (password !== confirmPassword) {
      this.printError('Passwords do not match.');
      return;
    }

    this.fynishRegistration(name, password, email);
  }


  private fynishRegistration(name: string, password: string, email: string): void {
     this.usrctrl.register(name, email, password)
      .subscribe({
        next: response => {
          if (response.success)
            this.login(name, password)
          else
            this.printError('Cannot register user: ' + response.description)    
        },
        error: err => {
          this.printError('Cannot create user, server responded with error');
          console.error('Registration error: ', err);
        }
      });
  }
  private login(name: string, password: string) : void {
    this.usrctrl.login(name, password)
      .subscribe({
        next: response => {
          if (response.userIdentification.trim()) {
            User.Id = response.userIdentification;
            this.redirecter.Group(response.lastGroupId);
            this.heart.startBeat();
          }
          else 
            this.printError('cannot login user, user data is not valid');
        },
        error: err => {
          this.printError('Cannot finish user loging, server failed');
          console.error("Login in registration error: ", err);
        }
      })
  }
    

  

}
