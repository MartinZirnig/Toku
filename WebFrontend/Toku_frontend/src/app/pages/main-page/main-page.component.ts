import { Component, numberAttribute, OnInit } from '@angular/core';
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
import { Redirecter } from '../../data_managements/redirecter.service';
import { Cache } from '../../data_managements/cache';
import { User } from '../../data_managements/user';
import { FileDownloadComponent } from '../../Components/file-download/file-download.component';
import { FileDownloadPopupService } from '../../services/file-download-popup.service';
import { PopUpService } from '../../services/pop-up.service';
import { MessagerService } from '../../data_managements/messager.service';
import { MessageFilterService } from '../../services/message-filter.service';

@Component({
  selector: 'app-main-page',
  imports: [
    Message_senderComponent,
    MessageAdresatorComponent,
    RouterOutlet,
    NgClass,
    NgFor,
    NgIf,
    DummyMessageAdresatorComponent,
    DummyMessageSenderComponent,
    FileDownloadComponent
],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  public messages: Array<any> = [];
  public rawMessages: Array<StoredMessageModel> = []
  public roomId: number = 0;
  public dummyVisible: boolean = true;

  showFileDownloadPopup = false;

constructor(
  private route: ActivatedRoute,
  private msgCtrl: MessageControllService,
  private grpCtrl: GroupsLoaderService,
  private sendService: MainInputService,
  private ngZone: NgZone,
  private redirecter: Redirecter,
  public fileDownloadPopupService: FileDownloadPopupService,
  private popup: PopUpService,
  private messager: MessagerService,
  private filter: MessageFilterService
) {}

ngOnInit(): void {
  this.filter.Load();
  this.dummyVisible = true;
  this.sendService.messageAdded = this.AddMessage.bind(this);
  this.sendService.mainPage = this;
  
  this.route.fragment.subscribe(fragment => {
    const url = this.redirecter.GetUrl().split('#')[0];
    if (url === '/main') {
          this.redirectWhenAccessDenied(fragment ?? '');
          const numeralFragment = Number(fragment); 
          if (Number.isNaN(numeralFragment) 
            || numeralFragment === 0)
            this.invalidRoomId();
          this.roomId = numeralFragment;
          User.ActiveGroupId = fragment ?? '';
          this.initializeMessages(numeralFragment);
          this.readMessages(numeralFragment);
    }
    else {
      var id = Number(Cache.peek('room'));
      this.initializeMessages(id);
      this.readMessages(id);
    }
    });

    setTimeout(() => {
      this.dummyVisible = false;
    }, 5);
  
    this.fileDownloadPopupService.visible$.subscribe(visible => {
      this.showFileDownloadPopup = visible;
    });

    this.messager.appendCallback("new-message", data => this.onMessage(data));
  }
  
  invalidRoomId(): void {

    if (Cache.peek('room') !== null) {
      const room = Number(Cache.peek('room'));
      if (!Number.isNaN(room)){
        this.redirecter.Chat(room);
      }
      else {
        this.redirecter.Login();
      }
    }
  }
  redirectWhenAccessDenied(id: string): void {
    if (!User.IsUserInGroup(id))
      this.redirecter.LastGroup();
  }

  initializeMessages(group: number): void {
    this.msgCtrl.loadMessages(group)
      .subscribe({
        next: response => {
          this.rawMessages = response;
          this.messages = [];
  
          this.rawMessages.forEach(msg => {
            if (this.filter.IsNotFiltered(msg.messageId))
              this.AddMessage(msg)
            });
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
    const message = new MessageFormat(
        msg.messageContent, msg.time, 
        stat, msg.pinnedMessagePrewiev ?? null, 
        (msg.attachedFilesId?.length ?? 0) !== 0, msg.timeStamp ?? null, sender, msg)

    this.messages.push(message);
  
  this.ngZone.onStable.pipe(take(1)).subscribe(() => {
    this.dummyVisible = false;
    this.scrollDown();
  });
}

private scrollDown(){
  setTimeout(() => {
    const container = document.querySelector('.main-page-inner');
    if (container) {
      container.scrollTop = container.scrollHeight;
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, 0);
}

  onDeleteMessage(index: number): void {
    this.messages.splice(index, 1);
  }

  private onMessage(data: string) {
    try{
    const splited = data.split('#', 3);
 
    const user = splited[0];
    this.popup.showMessage(user + " napsal zprávu");

    const groupId = splited[1];
    if (Number(groupId) !== this.roomId){
      return;
    }

    const messageData = splited[2].split('&', 9);
    const files = messageData[7].split('$').map( x => Number(x))

    const model = new StoredMessageModel(
      Number(messageData[0]), messageData[1], Number(messageData[2]),
      Number(messageData[3]), messageData[4], messageData[5],
      messageData[6], files , Number(messageData[8])
    );
    model.status = 255;

    this.AddMessage(model);
    }
catch (error)
{ 
  console.error(error);
}
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
