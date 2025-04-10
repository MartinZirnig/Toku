import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BackgroundLoginComponent } from '../../Components/background-login/background-login.component';

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

  constructor(private fb: FormBuilder, private router: Router) {
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

    const relationCode = this.fynishLoginAndGetRelationCode(name, password);
    if (relationCode === '') {
      this.printError('Invalid login. Please try again.');
      return;
    }

    alert('Login successful!');
    sessionStorage.setItem('relationCode', relationCode); // Store the relation code in session storage
    this.router.navigate(['/main']); // Navigate to the main page
  }

  fynishLoginAndGetRelationCode(name: string, password: string) : string {
    console.log('logging: ', {name, password});

    return 'relationCode'; 
  }

  
  loginWithGoogle() {
    console.log('Logging in with Google');
  }
}
