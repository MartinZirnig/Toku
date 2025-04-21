import { NgIf } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { NgModel } from '@angular/forms';

import { Router } from '@angular/router';

@Component({
  selector: 'app-user-settings',
  imports: [NgIf],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'] // Fixed typo: styleUrl -> styleUrls
})
export class UserSettingsComponent {
  constructor(private router: Router) {}
 

  ngOnInit() {
    document.body.style.overflow = 'hidden'; // Disable scrolling
  }

  ngOnDestroy() {
    document.body.style.overflow = ''; // Re-enable scrolling
  }

  gotomainPage() {
    this.router.navigate(['/main']);
  }

  @HostListener('document:keydown', ['$event']) // Listen to keydown events on the document
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') { // Ensure the key is correctly detected
      this.gotomainPage(); // Navigate to main page on Escape key press
    }
  }

/*
  onEdit(): void {
    this.isEditing = true; // Enable edit mode
    this.editableText = this.text; // Initialize editable text with the current message
  }
*/
}
