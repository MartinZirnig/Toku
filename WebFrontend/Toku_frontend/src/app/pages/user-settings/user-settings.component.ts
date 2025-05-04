import { NgClass, NgIf } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms'; // Import FormsModule
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // Import DomSanitizer

@Component({
  selector: 'app-user-settings',
  imports: [NgIf, FormsModule, NgClass], // Include FormsModule here
  standalone: true,
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
  userName: string = 'John Pork';
  userPhone: string = '(248) 434-5508';
  userEmail: string = 'jporksigma.com';
  userAccountInfo: string = 'aktivní účet od: 1992';

  isEditingName: boolean = false;
  isEditingPhone: boolean = false;
  isEditingEmail: boolean = false;

  characterLimits = {
    name: 20,
    phone: 30,
    email: 30,
  };

  constructor(private router: Router, private sanitizer: DomSanitizer) {} // Inject DomSanitizer

  ngOnInit() {
    document.body.style.overflow = 'hidden'; // Disable scrolling
  }

  ngOnDestroy() {
    document.body.style.overflow = ''; // Re-enable scrolling
  }

  ngAfterViewInit() {
    this.updateCharacterLimits(); // Initial calculation
  }

  gotomainPage(): void {
    console.debug('Navigating to main page'); // Debug log for troubleshooting
    this.router.navigate(['/main']);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.gotomainPage();
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
          alert('Email is not valid!'); // Alert if email is invalid
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
