import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, HostListener } from '@angular/core';
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

@Component({
  selector: 'app-user-settings',
  imports: [NgIf, FormsModule, NgClass, NgFor, AreYouSurePopUpComponent],
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

  contacts: KnownUserDataModel[] = [];
  allKnownUsers: KnownUserDataModel[] = [];
  searchQuery: string = '';
  filteredUsers: KnownUserDataModel[] = [];
  showAddContactInput: boolean = false;

  invalidEmail: boolean = false;
  invalidPhone: boolean = false;

  showAreYouSure: boolean = false;
  contactToRemove: KnownUserDataModel | null = null;

  constructor(
    private redirecter: Redirecter,
    private sanitizer: DomSanitizer,
    private usrCtrl: UserControlService,
    private popupService: PopUpService,
    private areYouSureService: AreYouSurePopUpService
  ) {}

  ngOnInit() {
    document.body.style.overflow = 'hidden';
    this.originalName = this.userName;
    this.originalPhone = this.userPhone;
    this.originalEmail = this.userEmail;
    this.loadContacts();
    this.loadAllKnownUsers();
  }

  loadContacts() {
    this.usrCtrl.getKnownUsers().subscribe({
      next: (data: KnownUserDataModel[]) => {
        this.contacts = data;
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

    this.usrCtrl.updateUserData(this.userName, this.userEmail, this.userPhone)
      .subscribe({
        next: response => {
          if (response.success) {
            User.Data = new UserDataModel(
              this.userName, this.userEmail, this.userPhone, User.Active);
          } else {
            console.error('Failed to save changes!', response.description);
          }
        },
        error: err => {
          console.error('Error occurred while saving changes:', err);
        }
      });

    this.redirecter.LastGroup();
  }

  closeWithoutSave(): void {
    const changed =
      this.userName !== this.originalName ||
      this.userPhone !== this.originalPhone ||
      this.userEmail !== this.originalEmail;

    if (changed) {
      this.showAreYouSure = true;
      // Zajistěte, že updateText je předán a AreYouSurePopUpComponent správně zobrazuje třetí tlačítko
      this.areYouSureService.open(
        (result) => {
          this.showAreYouSure = false;
          if (result === 'yes') {
            this.userName = this.originalName;
            this.userPhone = this.originalPhone;
            this.userEmail = this.originalEmail;
            this.redirecter.LastGroup();
          } else if (result === 'update') {
            this.saveAndReturn();
          }
          // 'no' => zůstat na stránce
        },
        'You have unsaved changes. Do you want to leave without saving, or update your changes?',
        'Leave',
        'Stay',
        'Update' // <-- třetí možnost je předána
      );
      return;
    }
    this.userName = this.originalName;
    this.userPhone = this.originalPhone;
    this.userEmail = this.originalEmail;
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
    alert('Add contact functionality is not implemented yet.');
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
    // TODO: Zde zavolejte API pro přidání kontaktu, pokud existuje
    this.contacts = [...this.contacts, user];
    this.closeAddContactInput();
    // Pokud bude API, po úspěchu zavolejte this.loadContacts();
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
    // TODO: Call backend to remove contact if needed
    this.contacts = this.contacts.filter(c => c.userId !== contact.userId);
    // Optionally reload contacts from backend here
  }
}
