import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';
import { ChatLoginPopupGroupListComponent } from '../chat-login-popup-group-list/chat-login-popup-group-list.component';

@Component({
  selector: 'app-chat-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent,
    ChatLoginPopupGroupListComponent // this is correct, as ChatLoginPopupGroupListComponent is standalone
  ],
  templateUrl: './chat-login.component.html',
  styleUrls: ['./chat-login.component.scss']
})
export class ChatLoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  showGroupList = false;
  @Output() closed = new EventEmitter<void>();

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      groupName: ['', Validators.required],
      groupId: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      return;
    }
    // ...implement chat login logic here...
    this.errorMessage = '';
  }

  close() {
    this.closed.emit();
  }

  onSelectGroup(group: { name: string, id: number }) {
    this.loginForm.patchValue({
      groupName: group.name,
      groupId: group.id
    });
    this.showGroupList = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(event: KeyboardEvent) {
    this.close();
  }
}
