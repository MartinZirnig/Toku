import { Component, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { OpenAndcloseMenuService } from '../../services/open-andclose-menu.service';
import { CommonModule, NgIf } from '@angular/common';
import {
  chatItemBackground,
  chatItemHoverBackground,
  chatItemTextColor,
  chatItemSubTextColor,
  chatItemTimeColor,
  blurredBackground
} from '../../services/colors.service';
import { ActiveGroupComponent } from './active-group/active-group.component';
import { ActiveGroupMenuService } from '../../services/active-group-menu-service.service';
import { GroupsLoaderService } from '../../data_managements/control-services/groups-loader.service';
import { AvailableGroupsModel } from '../../data_managements/models/available-groups-model';
import { GroupReloadService } from '../../services/group-reload.service';
import { Route, Router } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';


@Component({
  selector: 'app-chat-menu-ui',
  templateUrl: './chat-menu-ui.component.html',
  imports: [CommonModule, NgIf, ActiveGroupComponent], // Ensure CommonModule is imported
  styleUrl: './chat-menu-ui.component.scss'
})
export class ChatMenuUiComponent {
  declare public items: [AvailableGroupsModel];
  @ViewChild('chatMenuContainer') chatMenuContainer!: ElementRef;
  private scrollPosition = 0;

  constructor(
    public menuService: OpenAndcloseMenuService,
    public activeMenuService: ActiveGroupMenuService,
    public loader: GroupsLoaderService,
    public reloader: GroupReloadService,
    private cdr: ChangeDetectorRef, // Inject ChangeDetectorRef
    public navigationService: NavigationService, private router: Router
  ) {
    reloader.groupReload = this.reload.bind(this);
  }

  navigateToGroupSettings(): void {
    this.router.navigate(['/group-settings']);
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
    }
  }

  ngOnDestroy() {
    if (this.chatMenuContainer) {
      this.chatMenuContainer.nativeElement.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  private onScroll(): void {
    if (this.chatMenuContainer) {
      this.scrollPosition = this.chatMenuContainer.nativeElement.scrollTop;
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
        this.items = response;
      },
      error: err => {
        console.error('cannot load groups', err)
      }
    });
  }

  public onEditClick(): void {
    this.activeMenuService.inEditMode = !this.activeMenuService.inEditMode;
  }

  public onChatItemClick(chatName: string): void {
    if (!this.activeMenuService.inEditMode) {
      alert(`Clicked on chat: ${chatName}`);
    }
  }
}
