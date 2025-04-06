import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmNewPassword: ['', Validators.required]
    });
  }

  printError(message: string) {
    this.errorMessage = message;
  }

  onSubmit() {
    const { oldPassword, newPassword, confirmNewPassword } = this.changePasswordForm.value;
    if (this.changePasswordForm.invalid) {
      this.printError('Please fill in all fields correctly.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      this.printError('New passwords do not match.');
      return;
    }

    this.fynishPasswordChange(oldPassword, newPassword);
    alert('Password changed successfully!');
  }

  fynishPasswordChange(oldPassword: string, newPassword: string) : void {
    console.log('Password change:', { oldPassword, newPassword });
    this.errorMessage = '';
  }
}
