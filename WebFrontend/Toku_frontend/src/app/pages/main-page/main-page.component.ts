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
  

  private AddMessage(msg: StoredMessageModel){
    const stat = StoredMessageModel.getStatus(msg.status);
    const sender = StoredMessageModel.isSender(msg.status);
    this.messages.push(
      new MessageFormat(
        msg.messageContent, msg.time, 
        stat, msg.pinnedMessagePrewiev ?? null, 
        msg.pinnedMessageId !== null, msg.timeStamp ?? null, sender
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
    public isSender: boolean
  ) { }
}