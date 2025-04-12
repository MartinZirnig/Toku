import { Component, OnInit } from '@angular/core';
import { InputUiComponent } from '../../Components/input-ui/input-ui.component';
import { MenuUiComponent } from '../../Components/menu-ui/menu-ui.component';
import { ChatMenuUiComponent } from '../../Components/chat-menu-ui/chat-menu-ui.component';
import { Message_senderComponent } from '../../Components/message_sender/message_sender.component';
import { MessageAdresatorComponent } from '../../Components/message-adresator/message-adresator.component';
import { RouterOutlet } from '@angular/router';
import { DummyMessageSenderComponent } from '../../Components/dummy-message-sender/dummy-message-sender.component';
import { DummyMessageAdresatorComponent } from '../../Components/dummy-message-adresator/dummy-message-adresator.component';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-main-page',
  imports: [
    InputUiComponent,
    ChatMenuUiComponent,
    Message_senderComponent,
    MessageAdresatorComponent,
    MenuUiComponent,
    RouterOutlet,
    DummyMessageSenderComponent,
    DummyMessageAdresatorComponent,
    NgClass,
    NgFor,
    NgIf
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  messages: Array<any> = []; // Initialize as an empty array

  ngOnInit(): void {
    this.initializeMessages(); // Populate messages on component initialization
  }

  initializeMessages(): void {
    this.messages = [
      { text: 'Čus, jak bylo dneska?', time: '14:07', isSender: false },
      { text: 'Ahoj, docela v pohodě...', time: '14:09', status: 'read', isSender: true },
      { text: 'Fakt jsem si připadala jak ve zpomaleným filmu', time: '14:10', status: 'read', previewText: 'To těžce znám...', hasFile: true, timeStamp: '14:10', isSender: true },
      { text: 'To těžce znám...', time: '14:12', isSender: false },
      { text: 'Ty jo, to už je skoro retro 😂', time: '14:13', status: 'read', isSender: true },
      { text: 'jakože thanks bro...', time: '14:15', isSender: false },
      { text: 'To zvládneš, stačí si k tomu pustit hudbudddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd', time: '14:22', isSender: false },
      { text: 'Jo, nebo to prostě nakreslím o přestávcegggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg', time: '14:23', status: 'delivered', isSender: true },
      { text: 'jako vždycky', time: '14:23', status: 'undelivered', isSender: true },
      { text: 'Jo, nebo to prostě nakreslím o přestávcegggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg', time: '14:23', status: 'delivered', isSender: true },
      { text: 'jako vždycky', time: '14:23', status: 'undelivered', isSender: true }
    ];
  }

  onDeleteMessage(index: number): void {
    this.messages.splice(index, 1); // Remove the message from the list
  }
}
