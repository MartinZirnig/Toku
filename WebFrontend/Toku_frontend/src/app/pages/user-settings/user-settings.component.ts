import { NgClass, NgIf } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms'; // Import FormsModule
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // Import DomSanitizer
import { User } from '../../data_managements/user';
import { Redirecter } from '../../data_managements/redirecter.service';
import { UserControlService } from '../../data_managements/control-services/user-control-service.service';
import { UserDataModel } from '../../data_managements/models/user-data-model';
import { PopUpService } from '../../services/pop-up.service';

@Component({
  selector: 'app-user-settings',
  imports: [NgIf, FormsModule, NgClass], // Include FormsModule here
  standalone: true,
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
  userName: string = User.Name;
  userPhone: string = User.Phone;
  userEmail: string = User.Email;
  userAccountInfo: string = 'Ativní od ' + User.Active;

  // Store original values for cancel
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

  selectedTab: 'user' | 'general' = 'user';

  invalidEmail: boolean = false;
  invalidPhone: boolean = false;

  constructor(
    private redirecter: Redirecter, 
    private sanitizer: DomSanitizer,
    private usrCtrl: UserControlService,
    private popupService: PopUpService // <-- přidej popupService
  ) {}

  ngOnInit() {
    document.body.style.overflow = 'hidden'; // Disable scrolling
    // Store original values on open
    this.originalName = this.userName;
    this.originalPhone = this.userPhone;
    this.originalEmail = this.userEmail;
  }

  ngOnDestroy() {
    document.body.style.overflow = ''; // Re-enable scrolling
  }

  ngAfterViewInit() {
    this.updateCharacterLimits(); // Initial calculation
  }

  // saveAndReturn() => uloží změny a zavře
  saveAndReturn(): void {
    this.invalidEmail = false;
    this.invalidPhone = false;

    // Email validace
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Telefon validace (povolí čísla, mezery, +, -, min. 6 číslic)
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
        '#dc2626', // Tailwind red-600
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

  // closeWithoutSave() => zavře bez uložení a obnoví původní hodnoty
  // Close settings without saving changes
  closeWithoutSave(): void {
    // Restore original values
    this.userName = this.originalName;
    this.userPhone = this.originalPhone;
    this.userEmail = this.originalEmail;
    this.redirecter.LastGroup();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
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
          this.confirmEdit('name'); // Close edit if already active
        } else {
          this.isEditingName = true;
          this.isEditingPhone = false;
          this.isEditingEmail = false;
        }
      } else if (field === 'phone') {
        if (this.isEditingPhone) {
          this.confirmEdit('phone'); // Close edit if already active
        } else {
          this.isEditingPhone = true;
          this.isEditingName = false;
          this.isEditingEmail = false;
        }
      } else if (field === 'email') {
        if (this.isEditingEmail) {
          this.confirmEdit('email'); // Close edit if already active
        } else {
          this.isEditingEmail = true;
          this.isEditingName = false;
          this.isEditingPhone = false;
        }
      }
    }, 3); // Delay of 3ms
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
      this.characterLimits.name = Math.floor(nameElement.offsetWidth / 10); // Approx. 10px per character
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
    const visiblePart = text.slice(0, limit - 3); // Reserve space for "..."
    const gradientPart = visiblePart.slice(-3).split('').map((char, index) => {
        const opacity = 1 - (index / 3) * 0.9; // Gradually decrease opacity for the last 3 characters
        const fontWeight = bold ? 'font-weight: bold;' : ''; // Apply bold styling if specified
        return `<span style="opacity: ${opacity}; ${fontWeight}">${char}</span>`;
    }).join('');
    const ellipsis = '...'.split('').map((char, index) => {
        const opacity = 1 - ((index + 3) / 6) * 0.9; // Gradually decrease opacity for the ellipsis
        const fontWeight = bold ? 'font-weight: bold;' : ''; // Apply bold styling if specified
        return `<span style="opacity: ${opacity}; ${fontWeight}">${char}</span>`;
    }).join('');
    const truncatedPart = visiblePart.slice(0, -3) + gradientPart + ellipsis; // Combine visible part, gradient, and ellipsis
    return this.sanitizer.bypassSecurityTrustHtml(truncatedPart); // Sanitize the HTML
  }
}
