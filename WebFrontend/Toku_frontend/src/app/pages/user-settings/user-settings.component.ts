import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, HostListener, Input, model } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { User } from '../../data_managements/user';
import { Redirecter } from '../../data_managements/redirecter.service';
import { UserControlService } from '../../data_managements/control-services/user-control-service.service';
import { UserDataModel } from '../../data_managements/models/user-data-model';
import { PopUpService } from '../../services/pop-up.service';
import { KnownUserDataModel } from '../../data_managements/models/known-user-data-model';
import { AreYouSurePopUpService } from '../../Components/are-you-sure-pop-up/are-you-sure-pop-up.service';
import { AreYouSurePopUpComponent } from '../../Components/are-you-sure-pop-up/are-you-sure-pop-up.component';
import { AiGroupVisibilityService } from '../../Components/chat-menu-ui/chat-menu-ui.component';
import { ProfilePictureCircledComponent } from '../../Components/profile-picture-circled/profile-picture-circled.component';
import { AddContactPopupComponent } from '../../Components/add-contact-popup/add-contact-popup.component';
import { UserService } from '../../data_managements/services/user.service';
import { FileService } from '../../data_managements/services/file.service';
import { ContactEditModel } from '../../data_managements/models/contact-edit-model';
import { SwipeInfoModel } from '../../data_managements/models/swipe-info-model';
import { Router } from '@angular/router';
import { use } from 'marked';

export type SwipeAction = 'reply' | 'react' | 'copy' | 'delete' | 'edit';

@Component({
  selector: 'app-user-settings',
  imports: [NgIf, FormsModule, NgClass, NgFor, AreYouSurePopUpComponent, ProfilePictureCircledComponent, AddContactPopupComponent],
  standalone: true,
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
  userName: string = User.Name;
  userPhone: string = User.Phone;
  userEmail: string = User.Email;
  userAccountInfo: string = 'Ativní od ' + User.Active;

  private originalName: string = User.Name;
  private originalPhone: string = User.Phone;
  private originalEmail: string = User.Email;

  isEditingName: boolean = false;
  isEditingPhone: boolean = false;
  isEditingEmail: boolean = false;

  characterLimits = {
    name: 20,
    phone: 30,
    email: 30,
  };

  selectedTab: 'user' | 'general' | 'contacts' = 'user';

  originalContacts: KnownUserDataModel[] = [];
  contacts: KnownUserDataModel[] = [];
  allKnownUsers: KnownUserDataModel[] = [];
  searchQuery: string = '';
  filteredUsers: KnownUserDataModel[] = [];
  showAddContactInput: boolean = false;
  showAddContactPopup = false;

  invalidEmail: boolean = false;
  invalidPhone: boolean = false;

  showAreYouSure: boolean = false;
  contactToRemove: KnownUserDataModel | null = null;

  showAiGroup: boolean = true;
  private originalShowAiGroup: boolean = true;

  swipeRightAction: SwipeAction = 'reply';
  swipeLeftAction: SwipeAction = 'react';

  userPicture: string | null = null;
  private originalUserPicture: string | null = null;

  userPictureId: string | null = null;
  originalUserPictureId: string | null = null;

  @Input() canChangeInformations: boolean = true;

  constructor(
    private redirecter: Redirecter,
    private sanitizer: DomSanitizer,
    private usrCtrl: UserControlService,
    private popupService: PopUpService,
    private areYouSureService: AreYouSurePopUpService,
    private aiGroupVisibility: AiGroupVisibilityService,
    private userService: UserService,
    private fileService: FileService,
    private router: Router // <-- přidat Router
  ) {}

  ngOnInit() {
    this.canChangeInformations = User.HasControl; 
    console.log(this.canChangeInformations);
    this.loadPicture();
    document.body.style.overflow = 'hidden';
    this.originalName = this.userName;
    this.originalPhone = this.userPhone;
    this.originalEmail = this.userEmail;
    this.loadContacts();
    this.loadAllKnownUsers();
    this.showAiGroup = this.aiGroupVisibility.visible;
    this.originalShowAiGroup = this.showAiGroup;
    this.loadSwipeActions();
    this.userPicture = null;
    this.originalUserPicture = this.userPicture;
  }

  loadContacts() {
    this.usrCtrl.getKnownUsers().subscribe({
      next: (data: KnownUserDataModel[]) => {
        this.contacts = data;
        this.originalContacts = data.map(c => c); 
      },
      error: (error: any) => {
        console.error('Error fetching contacts:', error);
        this.contacts = [];
      }
    });
  }

  loadAllKnownUsers() {
    this.usrCtrl.getKnownUsers().subscribe({
      next: (data: KnownUserDataModel[]) => {
        this.allKnownUsers = data;
        this.filteredUsers = data;
      },
      error: (error: any) => {
        this.allKnownUsers = [];
        this.filteredUsers = [];
      }
    });
  }

  loadSwipeActions() {
    const allowed: SwipeAction[] = ['reply', 'react', 'copy', 'delete', 'edit'];
    const right = User.RightSwipe;
    const left = User.LeftSwipe;
    this.swipeRightAction = allowed.includes(right as SwipeAction) ? (right as SwipeAction) : 'reply';
    this.swipeLeftAction = allowed.includes(left as SwipeAction) ? (left as SwipeAction) : 'react';
  }

  saveAndReturn(): void {
    this.invalidEmail = false;
    this.invalidPhone = false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s+\-()]{6,}$/;

    let hasError = false;
    if (!emailRegex.test(this.userEmail)) {
      this.invalidEmail = true;
      hasError = true;
    }
    if (!phoneRegex.test(this.userPhone)) {
      this.invalidPhone = true;
      hasError = true;
    }

    if (hasError) {
      this.popupService.showMessage(
        'Zkontrolujte správnost emailu a telefonu',
        2000,
        '#dc2626',
        '#fff'
      );
      return;
    }

    this.usrCtrl.updateUserData(this.userName, this.userEmail, this.userPhone, this.userPictureId ?? undefined)
      .subscribe({
        next: response => {
          if (response.success) {
            User.Data = new UserDataModel(
              this.userName, this.userEmail, this.userPhone, User.Active);

              const model = new SwipeInfoModel(
                this.swipeLeftAction, this.swipeRightAction
              )
              
              this.userService.setSwipes(model).subscribe({
                next: response => {
                    if (response.success){
                      User.LeftSwipe = this.swipeLeftAction;
                      User.RightSwipe = this.swipeRightAction;
                    } else {
                      console.error("Cannot set swipes: ", response.description);
                    }
                },
                error: err => {
                  console.error("Cannot set swipes: ", err);
                }
              })


          } else {
            console.error('Failed to save changes!', response.description);
          }
        },
        error: err => {
          console.error('Error occurred while saving changes:', err);
        }
      });

    this.originalUserPicture = this.userPicture;
    this.originalShowAiGroup = this.showAiGroup; // uložit novou hodnotu po uložení
    this.redirecter.LastGroup();
  }

  closeWithoutSave(): void {
    const changed =
      this.userName !== this.originalName ||
      this.userPhone !== this.originalPhone ||
      this.userEmail !== this.originalEmail ||
      this.showAiGroup !== this.originalShowAiGroup ||
      this.userPicture !== this.originalUserPicture ||
      !this.isSubsequence(this.contacts, this.originalContacts); // přidáno

    if (changed) {
      this.showAreYouSure = true;
      this.areYouSureService.open(
        (result) => {
          this.showAreYouSure = false;
          if (result === 'yes') {
            this.userName = this.originalName;
            this.userPhone = this.originalPhone;
            this.userEmail = this.originalEmail;
            this.showAiGroup = this.originalShowAiGroup;
            this.aiGroupVisibility.visible = this.originalShowAiGroup;
            this.userPicture = this.originalUserPicture; // přidáno
            this.redirecter.LastGroup();
          } else if (result === 'update') {
            this.saveAndReturn();
          }
        },
        'You have unsaved changes. Do you want to leave without saving, or update your changes?',
        'Leave',
        'Stay',
        'Update'
      );
      return;
    }
    this.userName = this.originalName;
    this.userPhone = this.originalPhone;
    this.userEmail = this.originalEmail;
    this.showAiGroup = this.originalShowAiGroup;
    this.aiGroupVisibility.visible = this.originalShowAiGroup;
    this.userPicture = this.originalUserPicture; // přidáno
    this.redirecter.LastGroup();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      // Otevři popup hned, nečekej na další změnu stavu
      this.closeWithoutSave();
    } else if (event.key === 'Enter') {
      if (this.isEditingName) {
        this.confirmEdit('name');
      } else if (this.isEditingPhone) {
        this.confirmEdit('phone');
      } else if (this.isEditingEmail) {
        this.confirmEdit('email');
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isInsideName = target.closest('.user-name');
    const isInsidePhone = target.closest('.phone-container');
    const isInsideEmail = target.closest('.email-container');

    if (!isInsideName && this.isEditingName) {
      this.confirmEdit('name');
    }
    if (!isInsidePhone && this.isEditingPhone) {
      this.confirmEdit('phone');
    }
    if (!isInsideEmail && this.isEditingEmail) {
      this.confirmEdit('email');
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateCharacterLimits();
  }

  toggleEdit(field: string): void {
    if (!this.canChangeInformations) return;
    setTimeout(() => {
      if (field === 'name') {
        if (this.isEditingName) {
          this.confirmEdit('name');
        } else {
          this.isEditingName = true;
          this.isEditingPhone = false;
          this.isEditingEmail = false;
        }
      } else if (field === 'phone') {
        if (this.isEditingPhone) {
          this.confirmEdit('phone');
        } else {
          this.isEditingPhone = true;
          this.isEditingName = false;
          this.isEditingEmail = false;
        }
      } else if (field === 'email') {
        if (this.isEditingEmail) {
          this.confirmEdit('email');
        } else {
          this.isEditingEmail = true;
          this.isEditingName = false;
          this.isEditingPhone = false;
        }
      }
    }, 3);
  }

  confirmEdit(field: string): void {
    if (field === 'name' && this.isEditingName) {
      this.isEditingName = false;
    } else if (field === 'phone' && this.isEditingPhone) {
      this.isEditingPhone = false;
    } else if (field === 'email' && this.isEditingEmail) {
      this.isEditingEmail = false;
    }
  }

  updateCharacterLimits(): void {
    const nameElement = document.querySelector('.user-name') as HTMLElement;
    const phoneElement = document.querySelector('.phone-container') as HTMLElement;
    const emailElement = document.querySelector('.email-container') as HTMLElement;

    if (nameElement) {
      this.characterLimits.name = Math.floor(nameElement.offsetWidth / 10);
    }
    if (phoneElement) {
      this.characterLimits.phone = Math.floor(phoneElement.offsetWidth / 10);
    }
    if (emailElement) {
      this.characterLimits.email = Math.floor(emailElement.offsetWidth / 10);
    }
  }

  getTruncatedTextWithGradient(text: string, limit: number, bold: boolean = false): SafeHtml {
    if (text.length <= limit) return text;
    const visiblePart = text.slice(0, limit - 3);
    const gradientPart = visiblePart.slice(-3).split('').map((char, index) => {
      const opacity = 1 - (index / 3) * 0.9;
      const fontWeight = bold ? 'font-weight: bold;' : '';
      return `<span style="opacity: ${opacity}; ${fontWeight}">${char}</span>`;
    }).join('');
    const ellipsis = '...'.split('').map((char, index) => {
      const opacity = 1 - ((index + 3) / 6) * 0.9;
      const fontWeight = bold ? 'font-weight: bold;' : '';
      return `<span style="opacity: ${opacity}; ${fontWeight}">${char}</span>`;
    }).join('');
    const truncatedPart = visiblePart.slice(0, -3) + gradientPart + ellipsis;
    return this.sanitizer.bypassSecurityTrustHtml(truncatedPart);
  }

  openUserFinder() {
    this.showAddContactPopup = true;
  }

  onAddContactPopupClose() {
    this.showAddContactPopup = false;
  }

  onAddContactSelected(user: KnownUserDataModel) {
    this.addContact(user);
    this.showAddContactPopup = false;
  }

  closeAddContactInput() {
    this.showAddContactInput = false;
    this.searchQuery = '';
    this.filteredUsers = [];
  }

  onSearchUserInput(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchQuery = value;
    this.filteredUsers = this.allKnownUsers.filter(user =>
      user.name.toLowerCase().includes(value) &&
      !this.contacts.some(c => c.userId === user.userId)
    );
  }

  addContact(user: KnownUserDataModel) {
    if (this.contacts.some(c => c.userId === user.userId)) {
      this.closeAddContactInput();
      return;
    }
    const model = new ContactEditModel(
          user.userId,
          true
        );
    this.userService.updateContact(model).subscribe({
      next: response => {
          if (response.success) {
            this.contacts = [...this.contacts, user];
            this.closeAddContactInput();
          } else {
            console.error(`Error in adding contact: `, response.description)
          }
      },
      error: err => {
        console.error(`Error in adding contact: `, err)
      }
    });
  }

  onRemoveContactClick(contact: KnownUserDataModel) {
    this.contactToRemove = contact;
    this.showAreYouSure = true;
    this.areYouSureService.open(
      (result) => {
        if (result === 'yes' && this.contactToRemove) {
          this.removeContact(this.contactToRemove);
        }
        this.showAreYouSure = false;
        this.contactToRemove = null;
      },
      `Do you really want to remove "${contact.name}" from your contacts?`,
      'Yes',
      'No'
    );
  }

  removeContact(contact: KnownUserDataModel) {
    const model = new ContactEditModel(
      contact.userId,
      false
    );
    this.userService.updateContact(model).subscribe({
      next: response => {
          if (response.success) {
            this.contacts = this.contacts.filter(c => c.userId !== contact.userId);
          } else {
            console.error(`Error in removing contact: `, response.description)
          }
      },
      error: err => {
        console.error(`Error in removing contact: `, err)
      }
    })
  }

  onAiGroupToggle() {
    this.aiGroupVisibility.visible = this.showAiGroup;
  }

  setSwipeRightAction(action: SwipeAction) {
    this.swipeRightAction = action;
    localStorage.setItem('swipeRightAction', action);
  }

  setSwipeLeftAction(action: SwipeAction) {
    this.swipeLeftAction = action;
    localStorage.setItem('swipeLeftAction', action);
  }

  onUserPictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      alert('Only JPG and PNG files are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    this.fileService.saveUserFile(formData, crypto.randomUUID()).subscribe({
      next: (response) => {
        if (response.success) {
          this.userPictureId = response.description;
          this.originalUserPictureId = response.description;
          this.loadPictureFile(this.userPictureId);
          this.popupService.showMessage('Profile picture updated successfully!', 2000, '#4ade80', '#fff');
        } else {
          console.error('Error uploading picture:', response.description);
          this.popupService.showMessage('Failed to upload picture: ' + response.description, 2000, '#dc2626', '#fff');
        }
      },
      error: (error) => {
        console.error('Error uploading picture:', error);
        this.popupService.showMessage('Error uploading picture: ' + error.message, 2000, '#dc2626', '#fff');
      }
    })
  }

  triggerPictureInput(input: HTMLInputElement): void {
    input.click();
  }

  hasUnsavedChanges(): boolean {
    return (
      this.userName !== this.originalName ||
      this.userPhone !== this.originalPhone ||
      this.userEmail !== this.originalEmail ||
      this.showAiGroup !== this.originalShowAiGroup ||
      this.userPicture !== this.originalUserPicture ||
      this.originalUserPictureId !== this.userPictureId
    );
  }

  loadPicture(): void {
    this.userService.getPicture(Number(User.InnerId)).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPictureFile(response.description, true);

          this.userPictureId = response.description;
          this.originalUserPictureId = response.description;
        } else {
          console.error('Error loading user picture:', response.description);
        }
      },
      error: (error) => {
        console.error('Error loading user picture:', error);
      }
    });
  }
  loadPictureFile(picId: string, update?: any) : void {
    this.fileService.getUserFile(picId).subscribe({
      next: file => {
        const reader = new FileReader();
        reader.onload = () => {
          this.userPicture = reader.result as string;
          if (update) {
            this.originalUserPicture = this.userPicture;
          }
        };
        reader.readAsDataURL(file.body as Blob);
      },
      error: (error) => {
        console.error('Error loading user picture file:', error);
      }
    });
  }
  private isSubsequence(a: any[], b: any[]) : boolean {
    if (a.length !== b.length)
      return false;

    for (let i = 0; i < a.length; i++){
      if (!b.includes(a[i]))
        return false;
    }
    for (let i = 0; i < a.length; i++){
      if (!a.includes(b[i]))
        return false;
    }

    return true;
  }

  redirectToChangePassword() {
    this.router.navigate(['changepass']);
  }

  onDeleteAccountClick() {
    this.showAreYouSure = true;
    this.areYouSureService.open(
      (result) => {
        this.showAreYouSure = false;
        if (result === 'yes') {
          // TODO: Implement actual delete logic here
          console.log('Account deletion confirmed');
        }
      },
      `You want to delete your account? ALL YOUR DATA WILL BE LOST PERMANENTLY!`,
      'Yes',
      'No'
    );
  }
}