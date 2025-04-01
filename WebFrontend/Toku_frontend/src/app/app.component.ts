import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconComponent } from './Components/icon/icon.component';
import { InputUIComponent } from './Components/input-ui/input-ui.component';
import { MenuUiComponent } from './Components/menu-ui/menu-ui.component';
import { ChatMenuUiComponent } from './Components/chat-menu-ui/chat-menu-ui.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
            IconComponent,
            InputUIComponent,
            MenuUiComponent, 
            ChatMenuUiComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
  
})

export class AppComponent {
  title = 'Toku_frontend';
  
}
