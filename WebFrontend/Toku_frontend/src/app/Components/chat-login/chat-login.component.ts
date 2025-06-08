import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';
import { ChatLoginPopupGroupListComponent } from '../chat-login-popup-group-list/chat-login-popup-group-list.component';
import { ColorManagerService } from '../../services/color-manager.service';
import { ColorSettingsModel } from '../../data_managements/models/color-settings-model';
import { GroupService } from '../../data_managements/services/group-service.service';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { PopUpService } from '../../services/pop-up.service';

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
  public csm: ColorSettingsModel;

  constructor(
    private fb: FormBuilder,
    private colorManager: ColorManagerService,
    private groupService: GroupService,
    private popup: PopUpService
  ) {
    this.loginForm = this.fb.group({
      groupName: ['', Validators.required],
      groupId: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      password: ['', Validators.required]
    });
    this.csm = this.colorManager.csm;
  }

  ngOnInit() {
    // Ochrana proti undefined
    if (!this.colorManager.csm || !this.colorManager.csm.inputBackground) {
      // případně fallback nebo return
      return;
    }

    // Nastav CSS proměnné na :host podle barev z csm
    const root = (this as any).el?.nativeElement ?? document.querySelector('app-chat-login') ?? document.documentElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    // Helpery pro převod
    const toRgba = (c: any) => c?.toRgbaString ? c.toRgbaString() : '';
    const toGrad = (g: any) => g?.toLinearGradientString ? g.toLinearGradientString(135) : '';

    setVar('--color-input-bg', toRgba(this.csm.inputBackground));
    setVar('--color-input-border', toRgba(this.csm.inputBorder));
    setVar('--color-input-border-focus', toRgba(this.csm.inputBorderFocus));
    setVar('--color-input-text', toRgba(this.csm.inputText));
    setVar('--color-input-placeholder', toRgba(this.csm.inputPlaceholder));
    setVar('--color-error', toRgba(this.csm.dangerText));
    setVar('--color-gradient-btn', toGrad(this.csm.confirmGradientButton));
    setVar('--color-gradient-btn-hover', toGrad(this.csm.confirmGradientButtonHover));
    setVar('--color-btn-text', toRgba(this.csm.buttonText));
    setVar('--color-close-btn', toRgba(this.csm.closeButtonIcon));
    setVar('--color-close-btn-hover', toRgba(this.csm.menuDeleteText));
    setVar('--color-card-bg', toRgba(this.csm.popupBackground));
    
    setVar('--color-label', toRgba(this.csm.secondaryText));
    setVar('--color-hashtag', toRgba(this.csm.inputBorderFocus));
    setVar('--color-group-list-btn-bg', toGrad(this.csm.gradientButton));
    setVar('--color-group-list-btn-hover-bg', toGrad(this.csm.gradientButtonHover));
    setVar('--color-group-list-btn-text', toRgba(this.csm.buttonText));
    setVar('--color-overlay-bg', toRgba(this.csm.overlayBackground));
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      return;
    }

    const name : string = this.loginForm.value.groupName;
    const id : number = this.loginForm.value.groupId;
    const password : string | null = this.loginForm.value.password;

    this.groupService.joinGroup(id, name, password ?? undefined).subscribe({
      next: response => {
        if (response.success) {
          this.loginForm.reset();
          this.popup.showMessage(`Vítejte ve skupině ${name}#${id}`);
          
        } else {
          this.errorMessage = 'Cannot join group, login is not valid.';
          console.error('Error joining group:', response.description);
        }
      },
      error: (err) => {
        this.errorMessage = 'Cannot join group, login is not valid.';
        console.error('Error joining group:', err);
      } 
    })

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