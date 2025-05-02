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
import { PopUpComponent } from '../../Components/pop-up/pop-up.component';
import { PopUpService } from '../../services/pop-up.service';


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
    DummyMessageSenderComponent,
    PopUpComponent
],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  public messages: Array<any> = [];
  public rawMessages: Array<StoredMessageModel> = []
  public roomId: number = 0;
  public dummyVisible: boolean = true;
  public popUps: Array<{ message: string; backgroundColor: string; textColor: string; id: number; duration: number }> = [];
  private popUpIdCounter: number = 0;

constructor(
  private route: ActivatedRoute,
  private msgCtrl: MessageControllService,
  private grpCtrl: GroupsLoaderService,
  private sendService: MainInputService,
  private ngZone: NgZone,
  private popUpService: PopUpService
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

    this.popUpService.message$.subscribe((message) => {
      if (message) {
        const duration = this.popUpService.getDuration();
        const backgroundColor = this.popUpService.getBackgroundColor();
        const textColor = this.popUpService.getTextColor();
        console.log('MainPageComponent: Received pop-up data:', { message, duration, backgroundColor, textColor });
        this.addPopUp(message, duration, backgroundColor, textColor);
      }
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

  private addPopUp(message: string, duration: number, backgroundColor: string, textColor: string): void {
    const id = this.popUpIdCounter++;
    console.log('Adding pop-up:', { message, backgroundColor, textColor, id, duration });
    this.popUps.push({ message, backgroundColor, textColor, id, duration });

    setTimeout(() => {
      console.log('Removing pop-up with ID:', id);
      this.removePopUp(id);
    }, duration);
  }

  private removePopUp(id: number): void {
    console.log('Before removal, popUps:', this.popUps);
    this.popUps = this.popUps.filter((popUp) => popUp.id !== id);
    console.log('After removal, popUps:', this.popUps);
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