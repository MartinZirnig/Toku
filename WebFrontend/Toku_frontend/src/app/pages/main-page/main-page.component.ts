import { AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, numberAttribute, OnInit, viewChild } from '@angular/core';
import { InputUiComponent } from '../../Components/input-ui/input-ui.component';
import { MenuUiComponent } from '../../Components/menu-ui/menu-ui.component';
import { ChatMenuUiComponent } from '../../Components/chat-menu-ui/chat-menu-ui.component';
import { Message_senderComponent } from '../../Components/message_sender/message_sender.component';
import { MessageAdresatorComponent } from '../../Components/message-adresator/message-adresator.component';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { DummyMessageSenderComponent } from '../../Components/dummy-message-sender/dummy-message-sender.component';
import { DummyMessageAdresatorComponent } from '../../Components/dummy-message-adresator/dummy-message-adresator.component';
import { NgClass, NgFor, NgIf } from '@angular/common';

import { EmojisPopUpComponent } from "../../Components/emojis-pop-up/emojis-pop-up.component";
import { ReactionCounterComponent } from '../../Components/reaction-counter/reaction-counter.component';

import { MessageControllService } from '../../data_managements/control-services/message-controll.service';
import { StoredMessageModel } from '../../data_managements/models/stored-message-model';
import { MainInputService } from '../../services/main-input.service';
import { NgZone } from '@angular/core';
import { take } from 'rxjs';
import { GroupsLoaderService } from '../../data_managements/control-services/groups-loader.service';


@Component({
  selector: 'app-main-page',
  imports: [
    InputUiComponent,
    ChatMenuUiComponent,
    Message_senderComponent,
    MessageAdresatorComponent,
    MenuUiComponent,
    RouterOutlet,
    NgClass,
    NgFor,
    NgIf,
    DummyMessageAdresatorComponent,
    DummyMessageSenderComponent
],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  public messages: Array<any> = [];
  public rawMessages: Array<StoredMessageModel> = []
  public roomId: number = 0;
  public dummyVisible: boolean = true;

constructor(
  private route: ActivatedRoute,
  private msgCtrl: MessageControllService,
  private grpCtrl: GroupsLoaderService,
  private sendService: MainInputService,
  private ngZone: NgZone
) {}

ngOnInit(): void {
  this.dummyVisible = true;
  this.sendService.messageAdded = this.AddMessage.bind(this);
  this.sendService.mainPage = this;

  this.route.fragment.subscribe(fragment => {
      const numeralFragment = Number(fragment); 
      if (Number.isNaN(numeralFragment) 
        || numeralFragment === 0)
        return;
      this.roomId = numeralFragment;
      this.initializeMessages(numeralFragment);
      this.readMessages(numeralFragment);
    });

    setTimeout(() => {
      this.dummyVisible = false;
    }, 5);
  }
  
  
  initializeMessages(group: number): void {
    this.msgCtrl.loadMessages(group)
      .subscribe({
        next: response => {
          console.log(response);
          this.rawMessages = response;
          this.messages = [];
  
          this.rawMessages.forEach(msg => this.AddMessage(msg));
        },
        error: err => {
          console.error('error during message loading: ', err)
        }
      });
  }
  readMessages(group: number): void {
    this.grpCtrl.readGroup(group).subscribe({
      next: response => {
        if (!response.success)
          console.warn("cannot read group: ", response.description)
      },
      error: err => {
        console.warn("failed read group: ", err)
      }
    })
  }
  


  initializeMessages(): void {
    this.messages = [
      { text: 'Čus, jak bylo dneska?', time: '14:07', isSender: false},
      { text: 'Ahoj, docela v pohodě...', time: '14:09', status: 'read', isSender: true},
      { text: 'Fakt jsem si připadala jak ve zpomaleným filmu', time: '14:10', status: 'read', previewText: 'To těžce znám...', hasFile: true, timeStamp: '14:10', isSender: true ,  reactionsData: '😂😂😂😂😂👌👌👌👌👍👍😀😀😀😀😀😀😀😀' },
      { text: 'To těžce znám...', time: '14:12', isSender: false ,  reactionsData: '😂😂😂😂😂👌👌👌👌👍👍😀😀😀😀😀😀😀😀' },
      { text: 'Ty jo, to už je skoro retro 😂', time: '14:13', status: 'read', isSender: true ,  reactionsData: '😂😂😂😂😂👌👌👌👌👍👍😀😀😀😀😀😀😀😀' },
      { text: 'jakože thanks bro...', time: '14:15', isSender: false ,  reactionsData: '😂😂😂😂😂👌👌👌👌👍👍😀😀😀😀😀😀😀😀' },
      { text: 'To zvládneš, stačí si k tomu pustit hudbudddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd', time: '14:22', isSender: false },
      { text: 'Jo, nebo to prostě nakreslím o přestávcegggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg', time: '14:23', status: 'delivered', isSender: true ,  reactionsData: '😂😂😂😂😂👌👌👌👌👍👍😀😀😀😀😀😀😀😀' },
      { text: 'jako vždycky', time: '14:23', status: 'undelivered', isSender: true ,  reactionsData: '😂😂😂😂😂👌👌👌👌👍👍😀😀😀😀😀😀😀😀' },
      { text: 'Jo, nebo to prostě nakreslím o přestávcegggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg', time: '14:23', status: 'delivered', isSender: true ,  reactionsData: '😂😂😂😂😂👌👌👌👌👍👍😀😀😀😀😀😀😀😀' },
      { text: 'jako vždycky', time: '14:23', status: 'undelivered', isSender: true ,  reactionsData: '😂😂😂😂😂👌👌👌👌👍👍😀😀😀😀😀😀😀😀' }
    ];

  private AddMessage(msg: StoredMessageModel){
    const stat = StoredMessageModel.getStatus(msg.status);
    const sender = StoredMessageModel.isSender(msg.status);
    this.messages.push(
      new MessageFormat(
        msg.messageContent, msg.time, 
        stat, msg.pinnedMessagePrewiev ?? null, 
        msg.pinnedMessageId !== null, msg.timeStamp ?? null, sender, msg
      ));
    
      this.ngZone.onStable.pipe(take(1)).subscribe(() => {
        this.dummyVisible = false;
        this.scrollDown();
      });

  }

  onDeleteMessage(index: number): void {
    this.messages.splice(index, 1);
  }


  private scrollDown(){
    window.scroll({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  }
}
class MessageFormat {
  constructor(
    public text: string,
    public time: string,
    public status: 'undelivered' | 'delivered' | 'read',
    public previewText: string | null,
    public hasFile: boolean,
    public timeStamp: string | null,
    public isSender: boolean, 
    public raw: StoredMessageModel
  ) { }
}