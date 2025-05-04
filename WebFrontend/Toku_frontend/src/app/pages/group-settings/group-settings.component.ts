import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserFinderComponent } from './user-finder/user-finder.component';
import { GroupSettingsService } from './group-settings.service';

// Define a shared interface for group members
interface GroupMember {
  name: string;
  isAdmin?: boolean;
  isChatManager?: boolean;
  canEditGroup?: boolean;
  canDeleteMessages?: boolean;
  canDeleteMessagesdd?: boolean;
}

@Component({
  selector: 'app-group-settings',
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgClass, NgFor, UserFinderComponent],
  standalone: true,
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.scss']
})
export class GroupSettingsComponent {
  groupName: string = 'Skupina';
  groupDescription: string = '';
  groupPassword: string = '';
  groupMembers: GroupMember[] = [
   /* 
   příklad jak by to mohlo vypadat
   { name: 'John Doe', isAdmin: true, canEditGroup: true },
    { name: 'Jane Smith', isChatManager: true, canDeleteMessages: true },
    { name: 'Alice Johnson' },
    { name: 'Bob Brown', isAdmin: true },
    { name: 'Charlie Davis' },
    { name: 'David Wilson', canEditGroup: true },
    { name: 'Eva Green' },
    */
  ];

  selectedMember: GroupMember | null = null;
  isEditingName: boolean = false;
  gridFits: boolean = true;
  isUserFinderVisible: boolean = false;
  maxNameLength: number = 15; // Default value

  // Define the permissions as an array of strings
  permissions = ['Admin', 'Chat Manager', 'Can Edit Group', 'Can Delete Messages', 'Can Delete Messagesdd'];
  permissionsForm: FormGroup;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private groupSettingsService: GroupSettingsService,
    private fb: FormBuilder
  ) {
    this.permissionsForm = this.fb.group(
      this.permissions.reduce<Record<string, boolean>>((acc, permission) => {
        acc[permission] = false; // Use `false` instead of `[false]`
        return acc;
      }, {})
    );
  }

  ngOnInit() {
    this.onResize();
    document.body.style.overflow = 'hidden';

    this.groupSettingsService.selectedUsers$.subscribe((users) => {
      users.forEach((user) => {
        if (!this.groupMembers.some((member) => member.name === user)) {
          this.groupMembers.push({ name: user });
        }
      });
      this.toggleUserFinder(true); // Explicitly close user-finder after adding users
    });
  }

  ngAfterViewInit(): void {
    this.calculateMaxNameLength();
    window.addEventListener('resize', this.calculateMaxNameLength.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.calculateMaxNameLength.bind(this));
    document.body.style.overflow = '';
  }

  calculateMaxNameLength(): void {
    const container = document.querySelector('.permissions-name-container') as HTMLElement;
    if (container) {
      const containerWidth = container.offsetWidth;
      const averageCharWidth = 8; // Approximate average width of a character in pixels
      this.maxNameLength = Math.floor(containerWidth / averageCharWidth);
    }
    
  }

  goToMainPage(): void {
    this.router.navigate(['/main']);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.goToMainPage();
    } else if (event.key === 'Enter' && this.isEditingName) {
      this.confirmEdit('name');
    }
  }

  @HostListener('swipeup', ['$event'])
  onSwipeUp(event: any): void {
    const memberElement = event.target.closest('.member-item');
    if (memberElement) {
      const memberName = memberElement.querySelector('span')?.textContent;
      const member = this.groupMembers.find(m => m.name === memberName);
      if (member) {
        this.removeMember(member);
      }
    }
  }

  @HostListener('window:resize', [])
  onResize(): void {
    const container = document.querySelector('.user-grid');
    if (container) {
      const isOverflowing = container.scrollWidth > container.clientWidth;
      this.gridFits = !isOverflowing;
    }
  }

  toggleEdit(field: string): void {
    if (field === 'name') {
      this.isEditingName = !this.isEditingName;
    }
  }

  confirmEdit(field: string): void {
    if (field === 'name') {
      this.isEditingName = false;
    }
  }

  addMember(): void {
    const newMemberName = prompt('Enter the name of the new member:');
    if (newMemberName) {
      this.groupMembers.push({ name: newMemberName });
    }
  }

  removeMember(member: { name: string }): void {
    this.groupMembers = this.groupMembers.filter(m => m !== member);
  }

  selectMember(member: GroupMember): void {
    this.selectedMember = member;

    // Populate the form with the selected member's permissions
    if (this.selectedMember) {
      this.permissions.forEach(permission => {
        const key = this.mapPermissionToKey(permission);
        if (this.selectedMember && key in this.selectedMember) {
          this.permissionsForm.get(permission)?.setValue(this.selectedMember[key] || false);
        }
      });
    }
  }

  updatePermissions(): void {
    if (this.selectedMember) {
        this.permissions.forEach(permission => {
            const key = this.mapPermissionToKey(permission);
            const control = this.permissionsForm.get(permission);
            if (control && this.selectedMember) {
                this.selectedMember[key] = control.value as never;
            }
        });
    }
  }

  private mapPermissionToKey(permission: string): keyof typeof this.selectedMember {
    return permission
      .replace(/\s+/g, '')
      .replace(/^\w/, c => c.toLowerCase()) as keyof typeof this.selectedMember;
  }

  saveGroupSettings(): void {
    console.log('Group settings saved:', {
      groupName: this.groupName,
      groupDescription: this.groupDescription,
      groupPassword: this.groupPassword,
      groupMembers: this.groupMembers
    });
    
  }

  logGroupSettings(): void {
    console.log('Group settings:', {
      groupName: this.groupName,
      groupDescription: this.groupDescription,
      groupPassword: this.groupPassword,
      groupMembers: this.groupMembers
    });
  }

  toggleUserFinder(forceClose: boolean = false): void {
    this.isUserFinderVisible = forceClose ? false : !this.isUserFinderVisible;
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

  updatePermission(permission: keyof Omit<NonNullable<typeof this.selectedMember>, 'name'>, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.selectedMember && input) {
        this.selectedMember[permission] = input.checked;
    }
  }
}
