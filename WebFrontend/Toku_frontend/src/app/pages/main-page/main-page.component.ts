import { Component } from '@angular/core';
import { InputUiComponent } from '../../Components/input-ui/input-ui.component';
import { MenuUiComponent } from '../../Components/menu-ui/menu-ui.component';
import { ChatMenuUiComponent } from '../../Components/chat-menu-ui/chat-menu-ui.component';
import { Message_senderComponent } from '../../Components/message_sender/message_sender.component';
import { MessageAdresatorComponent } from '../../Components/message-adresator/message-adresator.component';
@Component({
  selector: 'app-main-page',
  imports: [
    InputUiComponent, // Ensure all components here are standalone
    ChatMenuUiComponent, 
    Message_senderComponent, 
    MessageAdresatorComponent,
    MenuUiComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent {

}
