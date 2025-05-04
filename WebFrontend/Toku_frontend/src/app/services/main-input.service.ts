import { Injectable } from '@angular/core';
import { GroupService } from '../data_managements/services/group-service.service';
import { StoredMessageModel } from '../data_managements/models/stored-message-model';
import { MainPageComponent } from '../pages/main-page/main-page.component';
import { MessageModel } from '../data_managements/models/message-model';
import { User } from '../data_managements/user';
import { MessageControllService } from '../data_managements/control-services/message-controll.service';
import { MessageService } from '../data_managements/services/message.service';

@Injectable({
  providedIn: 'root'
})
export class MainInputService {
  declare public messageAdded: (msg: StoredMessageModel) => void
  declare public mainPage: MainPageComponent

  constructor(
    private service: MessageService
  ) {}

  sendMessage(content: string) {
    const model = new MessageModel(
      content, User.Id??'', this.mainPage.roomId)
    
      this.service.sendMessage(model).subscribe({
        next: response => {
          this.service.getMessage(response).subscribe({
            next: msg => {
              console.log(msg);
              console.log(typeof msg);
              this.messageAdded(msg);
            },
            error: err => {
              console.error("error in message loading: ", err)
            }
            })

        },
        error: err => {
          console.error("error in message sending: ", err)
        }
    })
  }

}
