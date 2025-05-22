import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MainPageComponent } from '../main-page/main-page.component';
import { ChatMenuUiComponent } from '../../Components/chat-menu-ui/chat-menu-ui.component';
import { MenuUiComponent } from '../../Components/menu-ui/menu-ui.component';
import { MenuService } from '../../services/menu.service';
import { NgClass, NgFor } from '@angular/common';
import { PopUpComponent } from '../../Components/pop-up/pop-up.component';
import { PopUpService } from '../../services/pop-up.service';
import { OpenAndcloseMenuService } from '../../services/open-andclose-menu.service';

@Component({
  selector: 'app-main-route',
  imports: [MainPageComponent, MenuUiComponent, ChatMenuUiComponent, NgClass, NgFor, PopUpComponent],
  templateUrl: './main-route.component.html',
  styleUrl: './main-route.component.scss'
})
export class MainRouteComponent {
  constructor(public menuService: OpenAndcloseMenuService)  {}

  ngOnInit() {
   
  }
}
