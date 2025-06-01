import { Component, AfterViewInit, ViewChild, ElementRef, HostListener, NgZone } from '@angular/core';
import { MainPageComponent } from '../main-page/main-page.component';
import { ChatMenuUiComponent } from '../../Components/chat-menu-ui/chat-menu-ui.component';
import { MenuUiComponent } from '../../Components/menu-ui/menu-ui.component';
import { MenuService } from '../../services/menu.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { PopUpComponent } from '../../Components/pop-up/pop-up.component';
import { PopUpService } from '../../services/pop-up.service';
import { OpenAndcloseMenuService } from '../../services/open-andclose-menu.service';
import { ContextMenuMessagesComponent } from '../../Components/context-menu-messages/context-menu-messages.component';
import { ContextMenuGroupsComponent } from '../../Components/context-menu-groups/context-menu-groups.component';
import { InputUiComponent } from '../../Components/input-ui/input-ui.component';
import { FileUploadService } from '../../services/file-upload.service';
import { FileFormComponent } from '../../Components/file-form/file-form.component';
import { ContextMenuPlusComponent } from '../../Components/context-menu-plus/context-menu-plus.component';
import { ChatLoginComponent } from '../../Components/chat-login/chat-login.component';

@Component({
  selector: 'app-main-route',
  imports: [MainPageComponent, MenuUiComponent, InputUiComponent, FileFormComponent, ChatMenuUiComponent, NgClass, InputUiComponent, NgIf, NgFor, PopUpComponent, ContextMenuMessagesComponent, ContextMenuGroupsComponent,ChatLoginComponent, ContextMenuPlusComponent],
  templateUrl: './main-route.component.html',
  styleUrl: './main-route.component.scss'
})
export class MainRouteComponent {
  atTop = true;
  atBottom = false;
  isFileFormVisible = false; // správná výchozí hodnota
  totalFileSize = '';
  fileCount = 0; // přidáno
  hasFiles = false;
  showChatLogin = false;

  constructor(
    public menuService: OpenAndcloseMenuService,
    private ngZone: NgZone, // přidej NgZone do konstruktoru
    private fileUploadService: FileUploadService
  )  {


    this.fileUploadService.files$.subscribe((files) => {
      this.hasFiles = files.length > 0;
      this.fileCount = files.length; // přidáno
      const totalSizeInBytes = files.reduce((sum, file) => sum + file.size, 0);

      if (totalSizeInBytes < 1024) {
        this.totalFileSize = `${totalSizeInBytes} B`;
      } else if (totalSizeInBytes < 1024 * 1024) {
        this.totalFileSize = `${(totalSizeInBytes / 1024).toFixed(2)} KB`;
      } else if (totalSizeInBytes < 1024 * 1024 * 1024) {
        this.totalFileSize = `${(totalSizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
      } else {
        this.totalFileSize = `${(totalSizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      }
    });
    this.fileUploadService.isVisible$.subscribe(
      (isVisible) => (this.isFileFormVisible = isVisible)
    );
  }

  openChatLogin() {
    this.showChatLogin = true;
  }

  closeChatLogin() {
    this.showChatLogin = false;
  }

  ngOnInit() {
    setTimeout(() => this.attachScrollListener(), 0);
    // Registrace funkce pro otevření chat-login
    (window as any).openChatLogin = this.openChatLogin.bind(this);
  }

  attachScrollListener() {
    const container = document.querySelector('.main-page-inner');
    if (container) {
      container.addEventListener('scroll', () => this.updateScrollButtons());
      this.updateScrollButtons();
    }
  }

  updateScrollButtons() {
    const container = document.querySelector('.main-page-inner');
    if (container) {
      const scrollTop = (container as HTMLElement).scrollTop;
      const scrollHeight = (container as HTMLElement).scrollHeight;
      const clientHeight = (container as HTMLElement).clientHeight;
      this.ngZone.run(() => {
        this.atTop = scrollTop <= 2;
        this.atBottom = scrollTop + clientHeight >= scrollHeight - 2;
      });
    }
  }

  scrollToTop() {
    const container = document.querySelector('.main-page-inner');
    if (container) {
      (container as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  scrollToBottom() {
    const container = document.querySelector('.main-page-inner');
    if (container) {
      (container as HTMLElement).scrollTo({ top: (container as HTMLElement).scrollHeight, behavior: 'smooth' });
    }
  }

}
