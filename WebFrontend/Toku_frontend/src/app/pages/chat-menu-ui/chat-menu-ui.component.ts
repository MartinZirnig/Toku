import { Component } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-menu-ui',
  templateUrl: './chat-menu-ui.component.html',
  
})
export class ChatMenuUiComponent {
  constructor(public navigationService: NavigationService, private router: Router) {}

  navigateToGroupSettings(): void {
    this.router.navigate(['/group-settings']);
  }
}
