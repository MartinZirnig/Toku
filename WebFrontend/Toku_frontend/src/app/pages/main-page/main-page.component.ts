import { Component, numberAttribute, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { GroupsLoaderService } from '../../data_managements/control-services/groups-loader.service';
import { Redirecter } from '../../data_managements/redirecter.service';
import { Cache } from '../../data_managements/cache';
import { User } from '../../data_managements/user';
import { FileDownloadComponent } from '../../Components/file-download/file-download.component';
import { FileDownloadPopupService } from '../../services/file-download-popup.service';
import { PopUpService } from '../../services/pop-up.service';
import { MessagerService } from '../../data_managements/messager.service';
import { MessageFilterService } from '../../services/message-filter.service';
import { FileService } from '../../data_managements/services/file.service';
import { from, Observable } from 'rxjs';
import { concatMap, filter, observeOn } from 'rxjs/operators';
import { AiService } from '../../data_managements/services/ai-service.service';
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
export class MainPageComponent implements OnInit, OnDestroy {
  public messages: Array<MessageFormat> = [];
  public rawMessages: Array<StoredMessageModel> = []
  public roomId: number = 0;
  public dummyVisible: boolean = true;

  fileMessageId?: number;

  showFileDownloadPopup = false;

  // Přidejte pole možností a proměnnou pro vybranou zprávu
  public suggestedMessages: string[] = [
  // Klasické přátelské zprávy se smajlíky
  'Ahoj! 👋',
  'Dobrý den! ☀️',
  'Hello! 🌍',
  'Jak se máš? 😊',
  'Můžeme si popovídat? 💬',
  'Zdravím! 🙌',
  'Co nového? 📰',
  'Přeji hezký den! 🌞',
  'Máš chvilku? ⏳',
  'Rád tě poznávám! 🤝',
  'Hi! 👋',
  'Good morning! 🌅',
  'How are you? 🙂',
  'Can we chat? 💭',
  'Greetings! 🙋',
  "What's new? 🔍",
  'Have a nice day! 🌼',
  'Do you have a moment? 🕒',
  'Nice to meet you! 😄',
  "Let's start a conversation! 🗨️",

  // Gen Z / Brainrot / Meme hlášky
  'Am I cooked? 🤯',
  'This chat bouta be mad lit 🔥',
  'Rizz check? 😏',
  'Who up tryna talk fr 💯',
  'W spawner in here? 🌀',
  'Just dropped in from Ohio 😭',
  'Bro I\'m in my villain arc rn 😈',
  'I\'m not him… or am I? 😶‍🌫️',
  'Skibidi this convo? 💀',
  'Caught in 4K texting an AI 📸',
  'Let’s talk before my attention span resets ⏳',
  'Bro’s got that main character aura 💫',
  'Sigma mode: activated 🕶️',
  'Need some rizz advice 😔',
  'POV: You’re texting a mysterious sigma man 🧠',
  'I just respawned in chatland 👻',
  'Is this chat NPC or real one? 🤖',
  'Fanum tax paid, now we talkin’ 💵',
  'Lightskin stare loading… 👁️👄👁️',
];

  public suggestedMessage: string = '';
  public showEmptyChatHint: boolean = false; // Přidáno pro zpožděné zobrazení hlášky

  private emptyHintTimeout: any = null;

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
  private filter: MessageFilterService,
  private fileService: FileService,
  private aiService: AiService,
  private cdRef: ChangeDetectorRef
) {}

  // Přidejte tuto metodu do třídy
  private setRandomSuggestedMessage() {
    if (this.suggestedMessages.length > 0) {
      this.suggestedMessage = this.suggestedMessages[Math.floor(Math.random() * this.suggestedMessages.length)];
    }
  }

ngOnInit(): void {
  this.filter.Load();
  this.dummyVisible = true;
  this.sendService.messageAdded = this.addMessage.bind(this);
  this.sendService.mainPage = this;

  // Nastavte náhodnou hlášku při prvním načtení
  this.setRandomSuggestedMessage();

  this.route.fragment.subscribe(fragment => {
    const url = this.redirecter.GetUrl().split('#')[0];
    if (url === '/main') {
          this.redirectWhenAccessDenied(fragment ?? '');
          const numeralFragment = Number(fragment); 
          if (Number.isNaN(numeralFragment))
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

    this.resetEmptyHintTimerAfterDummy();
    this.setRandomSuggestedMessage();
  });

  setTimeout(() => {
    this.dummyVisible = false;
    this.setEmptyHintTimeout();
  }, 5);

  this.fileDownloadPopupService.visible$.subscribe(visible => {
    this.fileMessageId = this.fileDownloadPopupService.messageId;
    this.showFileDownloadPopup = visible;
  });

  this.messager.appendCallback("new-message", data => this.onMessage(data));

  this.suggestedMessage = this.suggestedMessages[Math.floor(Math.random() * this.suggestedMessages.length)];
}

// Přidejte tuto novou metodu pro správné resetování timeru po změně chatu
private resetEmptyHintTimerAfterDummy() {
  // Po každé změně chatu nastavte dummyVisible na true a po 5ms na false + timer
  this.dummyVisible = true;
  if (this.emptyHintTimeout) {
    clearTimeout(this.emptyHintTimeout);
  }
  setTimeout(() => {
    this.dummyVisible = false;
    this.setEmptyHintTimeout();
  }, 5);
}

// Přidejte metodu pro nastavení zpoždění
private setEmptyHintTimeout() {
  if (this.emptyHintTimeout) {
    clearTimeout(this.emptyHintTimeout);
  }
  this.showEmptyChatHint = false;

  // ODEBERTE tento testovací setTimeout, už není potřeba:
  // setTimeout(() => {
  //   console.log('TEST: simple setTimeout fired');
  // }, 500);

  this.emptyHintTimeout = setTimeout(() => {
    this.ngZone.run(() => {
      if (!this.dummyVisible && this.messages.length === 0) {
        this.showEmptyChatHint = true;
      }
    });
  }, 500);
}

// Upravte místa, kde se mění messages nebo dummyVisible, aby se znovu nastavilo zpoždění
private appendMessage(msg: StoredMessageModel, file?: string) {
  console.log(msg);
  const stat = StoredMessageModel.getStatus(msg.status);
  const sender = StoredMessageModel.isSender(msg.status);
  const message = new MessageFormat(
    msg.messageContent, msg.time,
    stat, msg.pinnedMessagePreview ?? null,
    msg.attachedFilesId?.length ?? 0, msg.timeStamp ?? null, sender, msg, file ?? "",
    msg.hasPinnedFile, msg.filesSize
  );
  message.picture = msg.prewiwePicture;

  this.messages.push(message);
  this.setEmptyHintTimeout();
}

onDeleteMessage(index: number): void {
  this.messages.splice(index, 1);
  this.setEmptyHintTimeout();
}

ngOnChanges() {
  this.setEmptyHintTimeout();
}

// Po vypnutí dummyVisible také nastavte timeout
ngAfterViewChecked() {
  // Volat pouze pokud se stav opravdu změnil
  // Tato metoda je volána extrémně často, proto zde NEVOLAT setEmptyHintTimeout bez podmínky!
  // Buď ji úplně odstraňte, nebo použijte např. nějakou podmínku, která zabrání opakovanému volání.
  // Nejjednodušší je ji úplně odstranit, protože setEmptyHintTimeout už voláte při změně dat a dummyVisible.

  // if (!this.dummyVisible) {
  //   this.setEmptyHintTimeout();
  // }
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
 if (group !== 0) {
  this.msgCtrl.loadMessages(group).subscribe({
    next: response => {
      this.rawMessages = response;
      this.messages = [];

      from(this.rawMessages)
        .pipe(
          filter(msg => this.filter.IsNotFiltered(msg.messageId)),
          concatMap(msg => this.AddManyMessage(msg))
        )
        .subscribe({
          complete: () => {
          },
          error: err => {
            console.error('Error while fetching messagesd:', err);
          }
        });
    },
    error: err => {
      console.error('Error while fetching messagesd:', err);
    }
  });
 } else {
  this.aiService.LoadChat().subscribe({
    next: response => {
      this.rawMessages = response;
      this.messages = [];
      console.log(response);
      response.forEach(msg => {
        this.rawMessages = response;
        this.appendMessage(msg);
      });
    },
    error: err => {
      console.error("cannot load ai chat: ", err)
    }
  })

 }
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
  


private addMessage(msg: StoredMessageModel): void {
  if (msg.senderPictureId && msg.status === 255) {
      this.fileService.getUserFile(msg.senderPictureId).subscribe({
        next: blob => {
          const reader = new FileReader();
          reader.onload = () => {
            this.loadMessage(msg);
            this.appendMessage(msg, reader.result as string);
          };
          reader.onerror = () => {
            console.error('Chyba při čtení obrázku');
            this.loadMessage(msg);
            this.appendMessage(msg);
          };
          reader.readAsDataURL(blob.body as Blob);
        },
        error: err => {
          console.error('Nepodařilo se načíst obrázek odesílatele:', err);
          this.loadMessage(msg);
          this.appendMessage(msg);
        }
      });
    } else {
      this.loadMessage(msg);
      this.appendMessage(msg);
    }
}
  

  private AddManyMessage(msg: StoredMessageModel) : Observable<void> {
    return new Observable<void>((observer) => {
    if (msg.senderPictureId && msg.status === 255) {
      this.fileService.getUserFile(msg.senderPictureId).subscribe({
        next: blob => {
          const reader = new FileReader();
          reader.onload = () => {
            this.loadMessage(msg);
            this.appendMessage(msg, reader.result as string);
            observer.next();
            observer.complete();
          };
          reader.onerror = () => {
            console.error('cannot load sender profile: No response');
            this.loadMessage(msg);
            this.appendMessage(msg);
            observer.next();
            observer.complete();
          };
          reader.readAsDataURL(blob.body as Blob);
        },
        error: err => {
          console.error('cannot load sender profile:', err);
            this.loadMessage(msg);
          this.appendMessage(msg);
          observer.next();
          observer.complete();
        }
      });
    } else {
      this.loadMessage(msg);
      this.appendMessage(msg);
      observer.next();
      observer.complete();
    }
  });
}

private loadMessage(msg: StoredMessageModel) : void {
  if (msg.pngId){
    console.log(msg);
    this.fileService.getGroupSecret(String(msg.pngId)).subscribe({
      next: response => {
          if (response) {
                      const reader = new FileReader();
          reader.onload = () => {
            msg.prewiwePicture = (reader.result as string);
          };
          reader.readAsDataURL(response.body as Blob);
          } else {
            console.error("cannot load picture prewiev: Not delivered");
          }
      },
      error: err => {
        console.error("cannot load picture prewiev: ", err);
      }
    })
  }
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

    this.addMessage(model);
    }
catch (error)
{ 
  console.error(error);
}
  }

  ngOnDestroy() {
    if (this.emptyHintTimeout) {
      clearTimeout(this.emptyHintTimeout);
    }
  }
}
class MessageFormat {
  constructor(
    public text: string,
    public time: string,
    public status: 'undelivered' | 'delivered' | 'read',
    public previewText: string | null,
    public filesCount: number,
    public timeStamp: string | null,
    public isSender: boolean, 
    public raw: StoredMessageModel,
    public senderPicture: string,
    public hasPinnedFile: boolean,
    public totalSize: number,
  ) { }

  public picture?: string;
}