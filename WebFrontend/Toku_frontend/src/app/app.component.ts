import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconComponent } from './Components/icon/icon.component';
import { InputUiComponent } from './Components/input-ui/input-ui.component';
import { MenuUiComponent } from './Components/menu-ui/menu-ui.component';
import { ChatMenuUiComponent } from './Components/chat-menu-ui/chat-menu-ui.component';
import { MessageComponent } from './message/message.component';

@Component({
  selector: 'app-root',
  imports: [InputUiComponent,
            MenuUiComponent, 
            ChatMenuUiComponent, 
            MessageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
  
})

export class AppComponent {
  title = 'Toku_frontend';
  
}
