import { Component, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { OpenAndcloseMenuService } from '../../services/open-andclose-menu.service';
import { CommonModule, NgIf } from '@angular/common';
import { ActiveGroupComponent } from './active-group/active-group.component';
import { ActiveGroupMenuService } from '../../services/active-group-menu-service.service';
import { GroupsLoaderService } from '../../data_managements/control-services/groups-loader.service';
import { AvailableGroupsModel } from '../../data_managements/models/available-groups-model';
import { GroupReloadService } from '../../services/group-reload.service';
import { NavigationService } from '../../services/navigation.service';
import { Redirecter } from '../../data_managements/redirecter.service';
import { User } from '../../data_managements/user';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-chat-menu-ui',
  templateUrl: './chat-menu-ui.component.html',
  imports: [CommonModule, NgIf, FormsModule, ActiveGroupComponent],
  styleUrl: './chat-menu-ui.component.scss'
})
export class ChatMenuUiComponent {
  items: AvailableGroupsModel[] = []; // <-- oprav deklaraci na pole
  filteredItems: AvailableGroupsModel[] = [];
  search: string = '';
  activeGroupId: string | number | null = null;
  @ViewChild('chatMenuContainer') chatMenuContainer!: ElementRef;
  private scrollPosition = 0;

  constructor(
    public menuService: OpenAndcloseMenuService,
    public activeMenuService: ActiveGroupMenuService,
    public loader: GroupsLoaderService,
    public reloader: GroupReloadService,
    private cdr: ChangeDetectorRef,
    public navigationService: NavigationService,
    private redirecter: Redirecter,
  ) {
    reloader.groupReload = this.reload.bind(this);
  }

  // Oprava názvu metody na appendGroup (správně)
  appendGroup() {
    this.redirecter.AddGroup();
  }



  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (window.innerWidth < 700) {
      this.menuService.showDropdown = false; // Close the chat menu
      this.menuService.isVisible = false; // Ensure animation state is updated
    }
  }

  ngOnInit() {
    this.reload();
  }

  ngAfterViewInit() {
    if (this.chatMenuContainer) {
      this.chatMenuContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
      this.chatMenuContainer.nativeElement.addEventListener('mouseenter', this.onScrollbarHover.bind(this));
      this.chatMenuContainer.nativeElement.addEventListener('mouseleave', this.onScrollbarLeave.bind(this));
    }
  }

  ngOnDestroy() {
    if (this.chatMenuContainer) {
      this.chatMenuContainer.nativeElement.removeEventListener('scroll', this.onScroll.bind(this));
      this.chatMenuContainer.nativeElement.removeEventListener('mouseenter', this.onScrollbarHover.bind(this));
      this.chatMenuContainer.nativeElement.removeEventListener('mouseleave', this.onScrollbarLeave.bind(this));
    }
  }

  private scrollTimeout: any = null;

  private onScroll(): void {
    if (this.chatMenuContainer) {
      this.scrollPosition = this.chatMenuContainer.nativeElement.scrollTop;
      this.showScrollbar();
    }
  }

  private onScrollbarHover(): void {
    this.showScrollbar();
  }

  private onScrollbarLeave(): void {
    if (this.chatMenuContainer) {
      this.chatMenuContainer.nativeElement.classList.remove('show-scrollbar');
    }
  }

  private showScrollbar(): void {
    if (this.chatMenuContainer) {
      this.chatMenuContainer.nativeElement.classList.add('show-scrollbar');
      if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.chatMenuContainer.nativeElement.classList.remove('show-scrollbar');
      }, 1000);
    }
  }

  public toggleMenu(): void {
    if (this.menuService.showDropdown) {
      // Save scroll position when closing
      this.scrollPosition = this.chatMenuContainer.nativeElement.scrollTop;
    }
    this.menuService.showDropdown = !this.menuService.showDropdown;

    if (!this.menuService.showDropdown) {
      return; // No need to restore scroll position if the menu is closed
    }

    // Use ChangeDetectorRef to ensure the DOM is updated before restoring scroll position
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.chatMenuContainer) {
        this.chatMenuContainer.nativeElement.scrollTop = this.scrollPosition;
      }
    }, 0); // Minimal delay to ensure the DOM is ready
  }

  reload(){
    const request = this.loader.getGroups()
    request.subscribe({
      next: response => {
        console.log(response)
        this.items = response || [];
        this.filteredItems = this.items; // vždy nastav i filteredItems
        User.Groups = this.items.map(group => String(group.groupId));
      },
      error: err => {
        console.error('cannot load groups', err)
        this.items = [];
        this.filteredItems = [];
      }
    });
  }

  onSearch(): void {
    const term = this.search.trim().toLowerCase();
    if (!term) {
      this.filteredItems = this.items;
    } else {
      this.filteredItems = this.items.filter(g =>
        g.groupName?.toLowerCase().includes(term) ||
        g.lastDecryptedMessage?.toLowerCase().includes(term)
      );
    }
  }

  public onEditClick(): void {
    this.activeMenuService.inEditMode = !this.activeMenuService.inEditMode;
  }

  public onChatItemClick(chatName: string): void {
    if (!this.activeMenuService.inEditMode) {
      alert(`Clicked on chat: ${chatName}`);
    }
  }

  onGroupMenuClick(item: AvailableGroupsModel, event: MouseEvent) {
    event.stopPropagation();
    // Zde otevřete menu, dialog, nebo proveďte další akce
    console.log('Menu pro skupinu:', item);
  }

  public setActiveGroup(groupId: string | number) {
    this.activeGroupId = groupId;
  }
}
