import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BackgroundLoginComponent } from '../../Components/background-login/background-login.component';

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

  constructor(private fb: FormBuilder, private router: Router) {
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

    const code = this.fynishRegistrationAndGetRelationCode(name, password, email);
    console.log(`Relation code:`, code);
  }


  fynishRegistrationAndGetRelationCode(name: string, password: string, email: string): string {
    console.log(`User:`, { name, password, email });

    alert('registration successful!');

    return 'relationCode';
  }  

  

}
