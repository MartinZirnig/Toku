import { formatPercent, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, HostListener, NgModule, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserFinderComponent } from './user-finder/user-finder.component';
import { GroupSettingsService } from './group-settings.service';
import { Redirecter } from '../../data_managements/redirecter.service';
import { ActivatedRoute } from '@angular/router';
import { GroupEditService } from '../../data_managements/control-services/group-edit.service';
import { GroupsLoaderService } from '../../data_managements/control-services/groups-loader.service';
import { GroupUserAccessModel } from '../../data_managements/models/group-user-access-model';
import { EventInfoWrapper } from '@angular/core/primitives/event-dispatch';
import { FormsModule } from '@angular/forms';
import { AreYouSurePopUpService } from '../../Components/are-you-sure-pop-up/are-you-sure-pop-up.service';
import { AreYouSurePopUpComponent } from '../../Components/are-you-sure-pop-up/are-you-sure-pop-up.component';



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
  imports: [NgIf, NgClass, NgFor, UserFinderComponent, StringifyPipe, FormsModule, AreYouSurePopUpComponent],
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

  selectedTab: 'general' | 'members' | 'permissions' | 'log' = 'general';

  showAreYouSure: boolean = false;

  private initialGroupName: string = '';
  private initialGroupDescription: string = '';
  private initialGroupPassword: string = '';
  private initialGroupMembers: GroupMember[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private groupSettingsService: GroupSettingsService,
    private redirecter: Redirecter,
    private route: ActivatedRoute,
    private grpEdi: GroupEditService,
    private grpLdr: GroupsLoaderService,
    private areYouSureService: AreYouSurePopUpService
    
  ) {}

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

    // Ulož původní hodnoty po načtení (malé zpoždění pro jistotu)
    setTimeout(() => this.saveInitialState(), 500);
  }

  private loadMembers(){
    var response = this.grpLdr.loadMembers(Number(this.roomId));
    response.subscribe({
      next: response => {
        response.forEach(data => {
          const parsed = this.parseAccessModel(data);
          this.groupMembers.push(parsed);
        })
        this.saveInitialState();
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
        this.saveInitialState();
      },
      error: err => {
        console.error('error during data loading', err)
      }
    })
  }

  private saveInitialState() {
    this.initialGroupName = this.groupName;
    this.initialGroupDescription = this.groupDescription;
    this.initialGroupPassword = this.groupPassword;
    this.initialGroupMembers = this.groupMembers.map(m => ({ ...m }));
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
    if (this.hasUnsavedChanges()) {
      this.showAreYouSure = true;
      this.areYouSureService.open(
        (result) => {
          this.showAreYouSure = false;
          if (result === 'yes') { // podporuj i 'leave'
            this.discardChanges();
            this.closeGroupSettings();
          } else if (result === 'update') {
            this.saveGroupSettings();
          }
          // 'no' => zůstat na stránce
        },
        'You have unsaved changes. Do you want to leave without saving, or update your changes?',
        'Leave',
        'Stay',
        'Update'
      );
      return;
    }
    this.closeGroupSettings();
  }

  // Implementujte podle vaší logiky
  hasUnsavedChanges(): boolean {
    // Porovnej aktuální hodnoty s původními
    if (
      this.groupName !== this.initialGroupName ||
      this.groupDescription !== this.initialGroupDescription ||
      this.groupPassword !== this.initialGroupPassword
    ) {
      return true;
    }
    if (this.groupMembers.length !== this.initialGroupMembers.length) {
      return true;
    }
    for (let i = 0; i < this.groupMembers.length; i++) {
      const a = this.groupMembers[i];
      const b = this.initialGroupMembers[i];
      if (
        a.name !== b.name ||
        a.userId !== b.userId ||
        a.isAdmin !== b.isAdmin ||
        a.isChatManager !== b.isChatManager ||
        a.canEditGroup !== b.canEditGroup ||
        a.canDeleteMessages !== b.canDeleteMessages ||
        a.canDeleteMessagesdd !== b.canDeleteMessagesdd
      ) {
        return true;
      }
    }
    return false;
  }

  discardChanges(): void {
    this.groupName = this.initialGroupName;
    this.groupDescription = this.initialGroupDescription;
    this.groupPassword = this.initialGroupPassword;
    this.groupMembers = this.initialGroupMembers.map(m => ({ ...m }));
  }

  closeGroupSettings(): void {
    // Redirect to main page
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

  // Při výběru uživatele v permissions záložce
  selectMember(member: GroupMember): void {
    this.selectedMember = member;
  }

  // Helper to get the value of a permission for a member
  getPermissionValue(member: GroupMember, permission: string): boolean {
    const key = this.mapPermissionToKey(permission);
    return !!(member as any)[key];
  }

  // Helper to update the permission when switch is toggled
  updatePermissionSwitch(permission: string, event: Event): void {
    if (!this.selectedMember) return;
    const key = this.mapPermissionToKey(permission);
    const input = event.target as HTMLInputElement;
    (this.selectedMember as any)[key] = input.checked;
  }

  private mapPermissionToKey(permission: string): keyof GroupMember {
    return permission
      .replace(/\s+/g, '')
      .replace(/^\w/, c => c.toLowerCase()) as keyof GroupMember;
  }

  // Při přepnutí záložky ulož permice a při návratu do permissions načti permice pro vybraného uživatele
  set selectedTabSafe(tab: 'general' | 'members' | 'permissions' | 'log') {
    this.selectedTab = tab;
  }
  get selectedTabSafe() {
    return this.selectedTab;
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
          // Redirect po úspěšném vytvoření
          this.redirecter.LastGroup();
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
          // Redirect po úspěšném updatu
          this.redirecter.LastGroup();
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
    // You may want to implement this to save permissions to backend if needed
  }

  // Předpřipravená metoda pro budoucí logování
  getGroupLog(): string {
    // Zde bude načtení logu ze služby nebo backendu
    return 'Zde bude log';
  }
}
