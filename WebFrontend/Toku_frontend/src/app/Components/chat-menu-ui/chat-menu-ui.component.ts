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
import { ContextMenuPlusService } from '../../services/context-menu-plus.service';
import { Injectable } from '@angular/core';
import { ColorManagerService } from '../../services/color-manager.service'; // přidej import

// Přidej službu pro správu viditelnosti AI skupiny
@Injectable({ providedIn: 'root' })
export class AiGroupVisibilityService {
  private _visible = true;
  get visible() { return this._visible; }
  set visible(val: boolean) { this._visible = val; }
}

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
  showAiGroup = true;
  
  aiGroup = {
    groupId: 0,
    groupName: 'AI bot',
    lastDecryptedMessage: 'Talk to your AI assistant!',
    picturePath: '',
    lastOperation: "" // změna z čísla na string
  }
  

  constructor(
    public menuService: OpenAndcloseMenuService,
    public activeMenuService: ActiveGroupMenuService,
    public loader: GroupsLoaderService,
    public reloader: GroupReloadService,
    private cdr: ChangeDetectorRef,
    public navigationService: NavigationService,
    private redirecter: Redirecter,
    private contextMenuPlus: ContextMenuPlusService, // přidej službu
    private aiGroupVisibility: AiGroupVisibilityService,
    private colorManager: ColorManagerService, // přidej službu
  ) {
    reloader.groupReload = this.reload.bind(this);
    this.csm = this.colorManager.csm;
  }
public csm; // přidej csm
  // Oprava názvu metody na appendGroup (správně)
  appendGroup(event?: MouseEvent) {
    // Otevři context menu plus na pozici tlačítka
    const x = event?.clientX ?? 120;
    const y = event?.clientY ?? 60;
    this.contextMenuPlus.open({
      x,
      y,
      actions: {
        groupSettings: () => {
          // Redirect na group-settings route
          this.redirecter.AddGroup();
        },
        chatLogin: () => {
          // Otevři chat-login v main-route
          (window as any).openChatLogin?.();
        }
      }
    });
  }



  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (window.innerWidth < 700) {
      this.menuService.showDropdown = false; // Close the chat menu
      this.menuService.isVisible = false; // Ensure animation state is updated
    }
  }

  ngOnInit() {
    this.showAiGroup = this.aiGroupVisibility.visible;
    this.reload();
  }

  ngAfterViewInit() {
    if (this.chatMenuContainer) {
      this.chatMenuContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
      this.chatMenuContainer.nativeElement.addEventListener('mouseenter', this.onScrollbarHover.bind(this));
      this.chatMenuContainer.nativeElement.addEventListener('mouseleave', this.onScrollbarLeave.bind(this));
    }
    // Nastav CSS proměnné pro barvy
    if (!this.csm) return;
    const root = this.chatMenuContainer?.nativeElement ?? document.documentElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    const csm = this.csm;
    setVar('--chat-menu-bg', csm.menuBackground.toRgbaString());
    setVar('--chat-menu-gradient-border', csm.menuGradientBorder.toLinearGradientString(135));
    setVar('--chat-menu-shadow', csm.menuShadow.toRgbaString());
    setVar('--chat-menu-item-bg', csm.cardBackground.toRgbaString());
    setVar('--chat-menu-item-hover-bg', csm.highlightBackground.toRgbaString());
    setVar('--chat-menu-item-text', csm.primaryText.toRgbaString());
    setVar('--chat-menu-item-secondary-text', csm.secondaryText.toRgbaString());
    setVar('--chat-menu-scrollbar-thumb', csm.scrollbarThumb.toRgbaString());
    setVar('--chat-menu-scrollbar-thumb-hover', csm.scrollbarThumbHover.toRgbaString());
    setVar('--chat-menu-scrollbar-track', csm.scrollbarTrack.toRgbaString());
    setVar('--chat-menu-plus-bg', csm.gradientButton.toLinearGradientString(135));
    setVar('--chat-menu-plus-bg-hover', csm.gradientButtonHover.toLinearGradientString(135));
    setVar('--chat-menu-plus-icon', csm.buttonText.toRgbaString());
    setVar('--chat-menu-search-bg', csm.inputBackground.toRgbaString());
    setVar('--chat-menu-search-text', csm.inputText.toRgbaString());
    setVar('--chat-menu-search-placeholder', csm.inputPlaceholder.toRgbaString());
    setVar('--chat-menu-search-icon', csm.inputPlaceholder.toRgbaString());

    // Ztmav barvu menuBackground pro header (např. o 10 %)
    const darkenRgba = (rgba: string, factor: number) => {
      // rgba(31,41,55,1.000)
      const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)/);
      if (!match) return rgba;
      let [r, g, b, a] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseFloat(match[4])];
      r = Math.max(0, Math.floor(r * (1 - factor)));
      g = Math.max(0, Math.floor(g * (1 - factor)));
      b = Math.max(0, Math.floor(b * (1 - factor)));
      return `rgba(${r},${g},${b},${a})`;
    };
    setVar('--chat-menu-header-bg', darkenRgba(csm.menuBackground.toRgbaString(), 0.10));
    // ...případně další barvy dle potřeby...
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
        this.items = response || [];
        this.filteredItems = this.items;
        User.Groups = this.items.map(group => String(group.groupId));
        // Přidej AI skupinu na začátek pokud je povolena
        if (this.aiGroupVisibility.visible) {
          this.filteredItems = [this.aiGroup, ...this.filteredItems];
        }
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
    let baseItems = this.items;
    if (this.aiGroupVisibility.visible) {
      baseItems = [this.aiGroup, ...this.items];
    }
    if (!term) {
      this.filteredItems = baseItems;
    } else {
      this.filteredItems = baseItems.filter(g =>
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
  }

  public setActiveGroup(groupId: string | number) {
    this.activeGroupId = groupId;
  }
}
