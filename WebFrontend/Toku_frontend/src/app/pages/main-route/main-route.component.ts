import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MainPageComponent } from '../main-page/main-page.component';
import { ChatMenuUiComponent } from '../../Components/chat-menu-ui/chat-menu-ui.component';
import { MenuUiComponent } from '../../Components/menu-ui/menu-ui.component';
import { MenuService } from '../../services/menu.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-main-route',
  imports: [MainPageComponent, MenuUiComponent, ChatMenuUiComponent, NgClass],
  templateUrl: './main-route.component.html',
  styleUrl: './main-route.component.scss'
})
export class MainRouteComponent {

  public activate = false;

  constructor(public menuService: MenuService) {}
  ngOnInit() {
   this.activate = this.menuService.isVisible
  }
  
 @HostListener('document:click')
  onDocumentClick(event: MouseEvent) {
    setTimeout(() => {
      this.activate = this.menuService.showDropdown;
    alert(this.activate);
    }, 20);
    
  }
}
