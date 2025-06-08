import { formatPercent, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, Input, NgModule, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserFinderComponent } from '../../Components/user-finder/user-finder.component';
import { GroupSettingsService } from '../../services/group-settings.service';
import { Redirecter } from '../../data_managements/redirecter.service';
import { ActivatedRoute } from '@angular/router';
import { GroupEditService } from '../../data_managements/control-services/group-edit.service';
import { GroupsLoaderService } from '../../data_managements/control-services/groups-loader.service';
import { GroupUserAccessModel } from '../../data_managements/models/group-user-access-model';
import { AreYouSurePopUpService } from '../../Components/are-you-sure-pop-up/are-you-sure-pop-up.service';
import { AreYouSurePopUpComponent } from '../../Components/are-you-sure-pop-up/are-you-sure-pop-up.component';
import { UserPermissionModel } from '../../data_managements/models/user-permission-model';
import { UserControlService } from '../../data_managements/control-services/user-control-service.service';
import { ProfilePictureCircledComponent } from '../../Components/profile-picture-circled/profile-picture-circled.component';
import { GroupService } from '../../data_managements/services/group-service.service';
import { FileService } from '../../data_managements/services/file.service';
import { NgModel, FormsModule } from '@angular/forms';




export class GroupMember {
  declare private basePermissions: number[];
  constructor(
    public name: string,
    public userId: number,
    public permissions: number[]
  ) {
    this.basePermissions = permissions.map(p => p);
  }
  get changed() : boolean {
    return this.basePermissions.length !== this.permissions.length ||
      this.basePermissions.some(p => !this.permissions.includes(p)) ||
      this.permissions.some(p => !this.basePermissions.includes(p));
  }
}


@Pipe({
  name: 'stringify',
  standalone: true
})
export class StringifyPipe implements PipeTransform {
  transform(value: any): string {
    return JSON.stringify(value, null, 2);
  }
}

@Component({
  selector: 'app-group-settings',
  imports: [NgIf, NgClass, NgFor, UserFinderComponent, FormsModule, AreYouSurePopUpComponent, ProfilePictureCircledComponent],

  standalone: true,
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.scss']
})
export class GroupSettingsComponent {
  groupName: string = 'Skupina';
  groupDescription: string = '';
  groupPassword: string = '';
  groupMembers: GroupMember[] = [];
  originalMembers: GroupMember[] = [];
;
  groupPicture: string | null = null; // profilová fotka skupiny
  groupPictureId?: number; 
  private initialGroupPicture: string | null = null;
  private initialGroupPictureId?: number; 

  selectedMember: GroupMember | null = null;
  isEditingName: boolean = false;
  isEditingDescription: boolean = false;
  isEditingPassword: boolean = false;
  gridFits: boolean = true;
  isUserFinderVisible: boolean = false;
  maxNameLength: number = 15;

  userAccess: number[] = [];
  declare roomId: string;
  logContent: string = "Zde bude log";

  permissions: UserPermissionModel[] = [];

  selectedTab: 'general' | 'members' | 'permissions' | 'log' = 'general';

  showAreYouSure: boolean = false;

  private initialGroupName: string = '';
  private initialGroupDescription: string = '';
  private initialGroupPassword: string = '';
  private initialGroupMembers: GroupMember[] = [];
  private initialIsPublicGroup: boolean = false;

  private _isPublicGroup: boolean = false;
  get isPublicGroup(): boolean {
    return this._isPublicGroup;
  }
  set isPublicGroup(value: boolean) {
    // Pokud se přepíná z public (true) na private (false), smaž heslo
    if (this._isPublicGroup && !value) {
      this.groupPassword = '';
    }
    this._isPublicGroup = value;
  }

  @Input() canEditGroup: boolean = true;
  @Input() canEditGroupPicture: boolean = true;
  @Input() canAddMembers: boolean = true;
  @Input() canEditPermissions: boolean = true;
  @Input() canViewLog: boolean = true;
  @Input() IsAllowedToSetGroupVisibility: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    private groupSettingsService: GroupSettingsService,
    private redirecter: Redirecter,
    private route: ActivatedRoute,
    private grpEdi: GroupEditService,
    private grpLdr: GroupsLoaderService,
    private areYouSureService: AreYouSurePopUpService,
    private usrCtrl: UserControlService,
    private groupService: GroupService,
    private fileService: FileService
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
    
    this.loadAccess();
    this.loadMembers();
    this.loadData();
    this.loadPermissions();
    this.loadLog();
    this.loadPicture();

    this.groupSettingsService.selectedUsers$.subscribe((users) => {
      users.forEach(user => {
        if (!this.groupMembers.some((member) => 
          member.name === user.name
        )) {
          const newMember = new GroupMember(user.name, user.userId, []);
          this.groupMembers.push(newMember);
        }
      });
      console.debug('Group Members:', this.groupMembers);
      this.toggleUserFinder(true);
    });

    // Ulož původní hodnoty po načtení (malé zpoždění pro jistotu)
    setTimeout(() => this.saveInitialState(), 2000);
  }

  private loadMembers(){
    var response = this.grpLdr.loadMembers(Number(this.roomId));
    response.subscribe({
      next: response => {
        this.groupMembers = [];
        this.originalMembers = [];
        console.log("users: ", response);
        response.forEach(data => {
          const parsed = this.parseAccessModel(data);
          this.groupMembers.push(parsed);
          this.originalMembers.push(parsed);
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
        // Nastav public/private podle hesla (pokud není heslo, je public)
        this.isPublicGroup = !response.password || response.password;
        this.groupPassword = typeof response.password === 'string' ? response.password : '';
        // this.groupPicture = response.picture ?? null; // načti profilovku
        // Oprava: Pokud GroupDataModel nemá picture, nastav na null nebo použij správný property
        this.groupPicture = null; // nebo např. response.groupPicture ?? null pokud existuje
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
    this.initialGroupMembers = this.groupMembers.map(m => m);
    this.initialGroupPicture = this.groupPicture;
    this.initialGroupPictureId = this.groupPictureId;
    this.initialIsPublicGroup = this.isPublicGroup;
  }

  private parseAccessModel(model: GroupUserAccessModel) : GroupMember {
    let result = new GroupMember(model.name ?? '', model.userId, model.permissions)
    model.permissions.forEach(permission => {
      
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

    this.loadMembers();
  }

  // Implementujte podle vaší logiky
hasUnsavedChanges(): boolean {
  return (
    this.hasBasicInfoChanged() ||
    this.hasPictureChanged() ||
    this.haveMembersChanged() ||
    this.hasPermissionsChanged()
  );
}

private hasPermissionsChanged(): boolean {
  return this.groupMembers.some(member => member.changed);
}

private hasBasicInfoChanged(): boolean {
  return (
    this.groupName !== this.initialGroupName ||
    this.groupDescription !== this.initialGroupDescription ||
    this.groupPassword !== this.initialGroupPassword ||
    this.isPublicGroup !== this.initialIsPublicGroup
  );
}

private hasPictureChanged(): boolean {
  return this.groupPicture !== this.initialGroupPicture;
}

private haveMembersChanged(): boolean {
  if (this.groupMembers.length !== this.initialGroupMembers.length) {
    return true;
  }

  return this.groupMembers.some((member, index) => {
    const original = this.initialGroupMembers[index];
    return member.name !== original.name || member.userId !== original.userId;
  });
}

  discardChanges(): void {
    this.groupName = this.initialGroupName;
    this.groupDescription = this.initialGroupDescription;
    this.groupPassword = this.initialGroupPassword;
    this.groupMembers = this.initialGroupMembers.map(m => m);
    this.groupPicture = this.initialGroupPicture;
    this.isPublicGroup = this.initialIsPublicGroup;
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
    } else if (field === 'description') {
      this.isEditingDescription = !this.isEditingDescription;
    } else if (field === 'password') {
      this.isEditingPassword = !this.isEditingPassword;
    }
  }

  confirmEdit(field: string): void {
    if (field === 'name') {
      this.isEditingName = false;
    } else if (field === 'description') {
      this.isEditingDescription = false;
    } else if (field === 'password') {
      this.isEditingPassword = false;
    }
  }

  addMember(): void {
    const newMemberName = prompt('Enter the name of the new member:');
    if (newMemberName) {
      this.groupMembers.push(new GroupMember(newMemberName, 0, []));
    }
  }

  removeMember(member: GroupMember): void {
    this.groupMembers = this.groupMembers.filter(m => m !== member);
  }

  // Při výběru uživatele v permissions záložce
  selectMember(member: GroupMember): void {
    this.selectedMember = member;
  }
  getPermissionValue(member: GroupMember, permission: UserPermissionModel): boolean {
    console.log(member.permissions);
    console.log(permission.code);
    return member.permissions.includes(permission.code)      
  }
  /*
  // Helper to get the value of a permission for a member
  getPermissionValue(member: GroupMember, permission: string): boolean {
    const key = this.mapPermissionToKey(permission);
    return !!(member as any)[key];
  }
    */
  updatePermissionSwitch(permission: UserPermissionModel, event: Event): void {
    this.selectedMember?.permissions.push(permission.code);
  }

    /*
  // Helper to update the permission when switch is toggled
  updatePermissionSwitch(permission: string, event: Event): void {
    
    
    

    if (!this.selectedMember) return;
    const key = this.mapPermissionToKey(permission);
    const input = event.target as HTMLInputElement;
    (this.selectedMember as any)[key] = input.checked;

    }
    */
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
    // Pokud je public, heslo se smaže
    if (this.isPublicGroup) {
      this.groupPassword = '';
    }
    this.StoreGroup();
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

  onGroupPictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      alert('Only JPG and PNG files are allowed.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    this.fileService.saveGroupFile(formData, crypto.randomUUID()).subscribe({
      next: response => {
        if (response.success) {
          this.groupPictureId = Number(response.description);
          const reader = new FileReader();
          reader.onload = () => {
            this.groupPicture = reader.result as string;
          };
          reader.readAsDataURL(file);
        } else {
          console.error('Error uploading group picture:', response.description);
        }
      },
      error: err => {
        console.error('Error uploading group picture:', err);
      }
    });


  }

  triggerPictureInput(input: HTMLInputElement): void {
    input.click();
  }

  private StoreGroup(): void {
    if (this.roomId === 'new') {
      this.CreateGroup();
    } else {
      this.UpdateGroup();
    }
  }

  private CreateGroup(): void {
    // Oprava: odeber groupPicture z argumentů
    // Přidejte isPublicGroup do createGroup pokud backend podporuje, jinak použijte groupPassword podle public/private
    const response = this.grpEdi.createGroup(
      this.groupName,
      this.groupDescription,
      this.isPublicGroup ? 1 : 0, // nebo použijte správný parametr pro public/private
      this.isPublicGroup ? '' : this.groupPassword
    );
    response.subscribe({
      next: response => {
        if (response.success) {
          this.roomId = response.description;
          this.redirecter.SetFragment(this.roomId);
          this.UpdateGroup();
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
    console.log("updating group with id: ", this.groupPictureId);
    const response = this.grpEdi.updateGroup(
      Number(this.roomId),
      this.groupName,
      this.groupDescription,
      this.isPublicGroup ? 1 : 0, // nebo použijte správný parametr pro public/private
      this.isPublicGroup ? '' : this.groupPassword,
      this.groupPictureId
    );
    response.subscribe({
      next: response => {
        if (response.success) {
          this.AppendGroupUsers();
          this.removeGroupUsers();
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
      console.log(user);
      this.AppendGroupUser(user);
    });

    new Promise(resolve => setTimeout(resolve, 1000)).then(() => this.setPermissions());

  }
  private removeGroupUsers() : void {
    this.originalMembers.forEach(user => {
      if (!this.groupMembers.includes(user))
          this.removeGroupUser(user);
    });
  }

  private AppendGroupUser(user: GroupMember): void {
    const response = this.grpEdi.addGroupMember(Number(this.roomId), Number(user.userId));
    response.subscribe({
      next: response => {
        if (!response.success) {
          console.error('Error adding user to group:', response.description);
        }
        console.log(`user ${user.name} added`);
      },
      error: (error) => {
        console.error('Error adding user to group:', error);
      }
    });
  }

  private removeGroupUser(user: GroupMember){
    const response = this.grpEdi.removeGroupMember(Number(this.roomId), Number(user.userId));
    console.log("removing user ", user)
    response.subscribe({
      next: response => {
        if (!response.success) {
          console.error('Error removing user  group:', response.description);
        }
        this.originalMembers = this.originalMembers.filter(om => om !== user)
      },
      error: (error) => {
        console.error('Error removing user from group:', error);
      }
    });
  }

  private setPermissions(): void {
    this.groupMembers.forEach(gm => {
      this.setPermission(gm);
    })
  }

  private setPermission(member: GroupMember): void {
    this.grpEdi.setUserAccess(Number(this.roomId), member.userId, [...new Set(member.permissions)]).subscribe({
      next: response => {
          if (!response.success){
            console.error(`cannot safe permissions fro user ${member.name}: ${response.description}`);
          }
      },
      error: err => {
        console.error(`cannot safe permissions fro user ${member.name}: `, err);
      }
    })  
  }

  // Předpřipravená metoda pro budoucí logování
  getGroupLog(): string {
    // Zde bude načtení logu ze služby nebo backendu
    return 'Zde bude log';
  }


  loadPermissions(): void {
    this.usrCtrl.getAvailablePermissions().subscribe({
      next: response => {
        this.permissions = response;
      },
      error: err =>{
          console.error(`Error in permission loading: `, err)
      }

    });
  }

  loadLog() : void {
    this.grpLdr.getLog(Number(this.roomId)).subscribe({
      next: response => {
        if (!response.success) {
          console.error("Cannot load log: ", response.description);
        }
        else {
          this.logContent = response.description;
        }
      },
      error: err => {
        console.error("Cannot load log: ", err);
      }
    })
  }
  loadPicture(): void {
    this.groupService.getPicture(Number(this.roomId)).subscribe({
      next: response => {
        if (response.success) {
          this.fileService.getGroupFile(response.description).subscribe({
            next: file => {
              if (file) {
                const reader = new FileReader();
                  reader.onload = () => {
                this.groupPicture = reader.result as string;
                  this.groupPictureId = Number(response.description);
                };
                reader.readAsDataURL(file.body as Blob);

              } else {
                console.error("Cannot load group picture file: No response received");
              }
            },
            error: err => {
              console.error("Cannot load group picture filče: ", err);
            }
          });

        } else {
          console.error("Cannot load group picture id: ", response.description);
        }
      },
      error: err => {
        console.error("Cannot load group picture id: ", err);
      }
    });
  }
  loadAccess() : void {
    this.groupService.getPermissions(Number(this.roomId)).subscribe({
      next: response =>  {
        if (response){
          this.userAccess = response;
          this.applyAccess(response);
        } else {
          console.error("cannot load user access: No input received")
        }
      },
      error: err => {
        console.error("cannot load user access: ", err)
      }
    })
  }
  applyAccess(access: number[]) : void {
    if (this.roomId === 'new')
      return;
    if (access.includes(255))
      return; // admin -> all allowed

    if (!access.includes(3))
      this.canEditGroup = false;
    if (!access.includes(4))
      this.canEditGroupPicture = false;
    if (!access.includes(5))
      this.canAddMembers = false;
    if (!access.includes(6))
      this.canEditPermissions = false;
    if (!access.includes(7))
      this.canViewLog = false;
  }
}