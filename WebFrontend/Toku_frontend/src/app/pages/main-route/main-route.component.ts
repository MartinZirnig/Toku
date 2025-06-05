import { Component, AfterViewInit, ViewChild, ElementRef, HostListener, NgZone, SimpleChange, SimpleChanges, OnChanges } from '@angular/core';
import { MainPageComponent } from '../main-page/main-page.component';
import { ChatMenuUiComponent } from '../../Components/chat-menu-ui/chat-menu-ui.component';
import { MenuUiComponent } from '../../Components/menu-ui/menu-ui.component';
import { NgClass, NgFor, NgIf, AsyncPipe } from '@angular/common';
import { PopUpComponent } from '../../Components/pop-up/pop-up.component';
import { OpenAndcloseMenuService } from '../../services/open-andclose-menu.service';
import { ContextMenuMessagesComponent } from '../../Components/context-menu-messages/context-menu-messages.component';
import { ContextMenuGroupsComponent } from '../../Components/context-menu-groups/context-menu-groups.component';
import { InputUiComponent } from '../../Components/input-ui/input-ui.component';
import { FileUploadService } from '../../services/file-upload.service';
import { FileFormComponent } from '../../Components/file-form/file-form.component';
import { ContextMenuPlusComponent } from '../../Components/context-menu-plus/context-menu-plus.component';
import { ChatLoginComponent } from '../../Components/chat-login/chat-login.component';
import { DeletePopupComponent } from '../../Components/delete-popup/delete-popup.component';
import { DeletePopupService } from '../../Components/delete-popup/delete-popup.service';
import { FileService } from '../../data_managements/services/file.service';
import { UserControlService } from '../../data_managements/control-services/user-control-service.service';
import { UserService } from '../../data_managements/services/user.service';
import { User } from '../../data_managements/user';

@Component({
  selector: 'app-main-route',
  imports: [
    MainPageComponent, MenuUiComponent, InputUiComponent, FileFormComponent, ChatMenuUiComponent,
    NgClass, InputUiComponent, NgIf, NgFor, AsyncPipe, PopUpComponent, ContextMenuMessagesComponent,
    ContextMenuGroupsComponent, ChatLoginComponent, ContextMenuPlusComponent,
    DeletePopupComponent
  ],
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

  declare public picture?: string;

  constructor(
    public menuService: OpenAndcloseMenuService,
    private ngZone: NgZone, // přidej NgZone do konstruktoru
    private fileUploadService: FileUploadService,
    public deletePopupService: DeletePopupService, // přidej tuto službu jako public
    private fileService: FileService,
    private userService: UserService
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
    (window as any).openChatLogin = this.openChatLogin.bind(this);

        this.userService.getPicture(Number(User.InnerId)).subscribe({
          next: (response) => {
            if (response.success) {

              this.fileService.getUserFile(response.description).subscribe({
                next: file => {
                  const reader = new FileReader();
                  reader.onload = () => {
                      this.picture = reader.result as string;
                  };
                  reader.readAsDataURL(file.body as Blob);
                },
                error: (error) => {
                  console.error('Error loading user picture file:', error);
                }
           });
            } else {
              console.error('Error loading user picture:', response.description);
            }
          },
          error: (error) => {
            console.error('Error loading user picture:', error);
          }
        });
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
