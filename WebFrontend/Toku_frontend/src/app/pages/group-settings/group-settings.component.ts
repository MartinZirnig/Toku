import { formatPercent, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, HostListener, Pipe, PipeTransform } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserFinderComponent } from './user-finder/user-finder.component';
import { GroupSettingsService } from './group-settings.service';
import { Redirecter } from '../../data_managements/redirecter.service';
import { ActivatedRoute } from '@angular/router';
import { GroupEditService } from '../../data_managements/control-services/group-edit.service';
import { GroupsLoaderService } from '../../data_managements/control-services/groups-loader.service';
import { GroupUserAccessModel } from '../../data_managements/models/group-user-access-model';
import { EventInfoWrapper } from '@angular/core/primitives/event-dispatch';


export class GroupMember {
  constructor(
    public name: string,
    public userId: number,
    public isAdmin: boolean = false,
    public isChatManager: boolean = false,
    public canEditGroup: boolean = false,
    public canDeleteMessages: boolean = false,
    public canDeleteMessagesdd: boolean = false
  ) {}
}

@Pipe({ name: 'stringify', standalone: true })
export class StringifyPipe implements PipeTransform {
  transform(value: any): string {
    return JSON.stringify(value, null, 2);
  }
}

@Component({
  selector: 'app-group-settings',
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgClass, NgFor, UserFinderComponent, StringifyPipe],
  standalone: true,
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.scss']
})
export class GroupSettingsComponent {
  groupName: string = 'Skupina';
  groupDescription: string = '';
  groupPassword: string = '';
  groupMembers: GroupMember[] = [];

  selectedMember: GroupMember | null = null;
  isEditingName: boolean = false;
  gridFits: boolean = true;
  isUserFinderVisible: boolean = false;
  maxNameLength: number = 15;

  declare roomId: string;

  permissions = ['Admin', 'Chat Manager', 'Can Edit Group', 'Can Delete Messages', 'Can Delete Messagesdd'];
  permissionsForm: FormGroup;

  selectedTab: 'general' | 'members' | 'permissions' | 'log' = 'general';

  constructor(
    private sanitizer: DomSanitizer,
    private groupSettingsService: GroupSettingsService,
    private fb: FormBuilder,
    private redirecter: Redirecter,
    private route: ActivatedRoute,
    private grpEdi: GroupEditService,
    private grpLdr: GroupsLoaderService
  ) {
    this.permissionsForm = this.fb.group(
      this.permissions.reduce<Record<string, boolean>>((acc, permission) => {
        acc[permission] = false;
        return acc;
      }, {})
    );
  }

  ngOnInit() {
    this.onResize();
    document.body.style.overflow = 'hidden';

    this.route.fragment.subscribe(fragment => {
      this.roomId = fragment ?? '';
      if (this.roomId === '') this.fynishEdit();
      if (this.roomId !== 'new') {
        this.loadExistingGroupSettings(this.roomId);
      }
    });
    
    this.loadMembers();
    this.loadData();

    this.groupSettingsService.selectedUsers$.subscribe((users) => {
      users.forEach(user => {
        if (!this.groupMembers.some((member) => 
          member.name === user.name
        )) {
          const newMember = new GroupMember(user.name, user.userId);
          console.debug('User:', user);
          console.debug('New Member:', newMember);
          this.groupMembers.push(newMember);
        }
      });
      console.debug('Group Members:', this.groupMembers);
      this.toggleUserFinder(true);
    });
  }

  private loadMembers(){
    var response = this.grpLdr.loadMembers(Number(this.roomId));
    response.subscribe({
      next: response => {
        response.forEach(data => {
          const parsed = this.parseAccessModel(data);
          this.groupMembers.push(parsed);
        })
      },
      error: err => {
        console.error('error during member loading', err)
      }
    })
  }
  private loadData(){
    var response = this.grpLdr.loadData(Number(this.roomId));
    response.subscribe({
      next: response => {
        this.groupName = response.name;
        this.groupDescription = response.description;
      },
      error: err => {
        console.error('error during data loading', err)
      }
    })
  }

  private parseAccessModel(model: GroupUserAccessModel) : GroupMember {
    let result = new GroupMember(model.name ?? '', model.userId)
    model.permissions.forEach(permission => {
      if (permission == 3)
        result.isAdmin = true;
      if (permission == 2)
        result.canDeleteMessages = true;
      if (permission == 1)
        result.canEditGroup = true;
    });

    return result;
  }

  ngAfterViewInit(): void {
    this.calculateMaxNameLength();
    window.addEventListener('resize', this.calculateMaxNameLength.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.calculateMaxNameLength.bind(this));
    if (this.permissionSyncSub) {
      this.permissionSyncSub.unsubscribe();
    }
    document.body.style.overflow = '';
  }

  calculateMaxNameLength(): void {
    const container = document.querySelector('.permissions-name-container') as HTMLElement;
    if (container) {
      const containerWidth = container.offsetWidth;
      const averageCharWidth = 8;
      this.maxNameLength = Math.floor(containerWidth / averageCharWidth);
    }
  }

  fynishEdit(): void {
    this.redirecter.LastGroup();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.fynishEdit();
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
      this.groupMembers.push(new GroupMember(newMemberName, 0));
    }
  }

  removeMember(member: GroupMember): void {
    this.groupMembers = this.groupMembers.filter(m => m !== member);
  }

  // Ukládání permicí při přepnutí uživatele nebo záložky
  private saveCurrentMemberPermissions() {
    if (!this.selectedMember) return;
    this.permissions.forEach(permission => {
      const key = this.mapPermissionToKey(permission);
      const control = this.permissionsForm.get(permission);
      // Oprava: kontrola existence selectedMember a control
      if (control && this.selectedMember) {
        (this.selectedMember as any)[key] = control.value as never;
      }
    });
  }

  // Při výběru uživatele v permissions záložce
  selectMember(member: GroupMember): void {
    this.saveCurrentMemberPermissions();
    this.selectedMember = null; // Force Angular to re-render the *ngIf block
    setTimeout(() => {
      this.selectedMember = member;
      // Pokud uživatel ještě nemá žádné permice, nastav všechny na false
      this.permissions.forEach(permission => {
        const key = this.mapPermissionToKey(permission);
        if (!(key in member)) {
          (member as any)[key] = false;
        }
        this.permissionsForm.get(permission)?.setValue((member as any)[key] || false, { emitEvent: false });
      });
      this.setupPermissionSync();
    }, 0);
  }

  // Synchronizace změn ve formuláři do vybraného uživatele
  private permissionSyncSub: any = null;
  private setupPermissionSync() {
    if (this.permissionSyncSub) {
      this.permissionSyncSub.unsubscribe();
    }
    this.permissionSyncSub = this.permissionsForm.valueChanges.subscribe(values => {
      if (this.selectedMember) {
        this.permissions.forEach(permission => {
          const key = this.mapPermissionToKey(permission);
          (this.selectedMember as any)[key] = values[permission];
        });
      }
    });
  }

  // Při přepnutí záložky ulož permice a při návratu do permissions načti permice pro vybraného uživatele
  set selectedTabSafe(tab: 'general' | 'members' | 'permissions' | 'log') {
    if (this.selectedTab === 'permissions') {
      this.saveCurrentMemberPermissions();
      if (this.permissionSyncSub) {
        this.permissionSyncSub.unsubscribe();
      }
    }
    this.selectedTab = tab;
    if (tab === 'permissions' && this.selectedMember) {
      // Force re-render to ensure correct permission display
      const member = this.selectedMember;
      this.selectedMember = null;
      setTimeout(() => {
        this.selectedMember = member;
        this.permissions.forEach(permission => {
          const key = this.mapPermissionToKey(permission);
          if (!(key in member)) {
            (member as any)[key] = false;
          }
          this.permissionsForm.get(permission)?.setValue((member as any)[key] || false, { emitEvent: false });
        });
        this.setupPermissionSync();
      }, 0);
    }
  }
  get selectedTabSafe() {
    return this.selectedTab;
  }

  updatePermissions(): void {
    if (this.selectedMember) {
      this.permissions.forEach(permission => {
        const key = this.mapPermissionToKey(permission);
        const control = this.permissionsForm.get(permission);
        if (control) {
          if (this.selectedMember)
              this.selectedMember[key]  = control.value as never;
        }
      });
    }
  }

  private mapPermissionToKey(permission: string): keyof GroupMember {
    return permission
      .replace(/\s+/g, '')
      .replace(/^\w/, c => c.toLowerCase()) as keyof GroupMember;
  }

  saveGroupSettings(): void {
    this.StoreGroup();

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

  updatePermission(permission: keyof Omit<GroupMember, 'name' | 'userId'>, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.selectedMember && input) {
      this.selectedMember[permission] = input.checked;
    }
  }

  loadExistingGroupSettings(id: string): void {}

  private StoreGroup(): void {
    if (this.roomId === 'new') {
      this.CreateGroup();
    } else {
      this.UpdateGroup();
    }
  }

  private CreateGroup(): void {
    const response = this.grpEdi.createGroup(this.groupName, this.groupDescription, 0, this.groupPassword);
    response.subscribe({
      next: response => {
        if (response.success) {
          this.roomId = response.description;
          this.redirecter.SetFragment(this.roomId);
          this.AppendGroupUsers();
        } else {
          console.error('Error creating group:', response.description);
        }
      },
      error: (error) => {
        console.error('Error creating group:', error);
      }
    });
  }

  private UpdateGroup(): void {
    const response = this.grpEdi.updateGroup(
      Number(this.roomId), this.groupName, this.groupDescription, 0, this.groupPassword);

    response.subscribe({
      next: response => {
        if (response.success) {
          this.AppendGroupUsers();
        } else {
          console.error('Error updating group:', response.description);
        }
      },
      error: (error) => {
        console.error('Error updating group:', error);
      }
    });
  }

  private AppendGroupUsers(): void {
    this.groupMembers.forEach(user => {
      this.AppendGroupUser(user);
    });
    this.setPermissions();
  }

  private AppendGroupUser(user: GroupMember): void {
    const response = this.grpEdi.addGroupMember(Number(this.roomId), Number(user.userId));
    response.subscribe({
      next: response => {
        if (!response.success) {
          console.error('Error adding user to group:', response.description);
        }
      },
      error: (error) => {
        console.error('Error adding user to group:', error);
      }
    });
  }

  private setPermissions(): void {
    this.groupMembers.forEach(user => {
      const permissions = this.permissionsForm.value;
      const response = this.grpEdi.setUserAccess(Number(this.roomId), Number(user.userId), permissions);
      response.subscribe({
        next: response => {
          if (!response.success) {
            console.error('Error updating user permissions:', response.description);
          }
        },
        error: (error) => {
          console.error('Error updating user permissions:', error);
        }
      });
    });
  }

  // Předpřipravená metoda pro budoucí logování
  getGroupLog(): string {
    // Zde bude načtení logu ze služby nebo backendu
    return 'Zde bude log';
  }
}
