import { CSP_NONCE, Injectable } from '@angular/core';
import { GroupService } from '../data_managements/services/group-service.service';
import { StoredMessageModel } from '../data_managements/models/stored-message-model';
import { MainPageComponent } from '../pages/main-page/main-page.component';
import { MessageModel } from '../data_managements/models/message-model';
import { User } from '../data_managements/user';
import { MessageControllService } from '../data_managements/control-services/message-controll.service';
import { MessageService } from '../data_managements/services/message.service';
import { AiService } from '../data_managements/services/ai-service.service';
import { AiQueryModel } from '../data_managements/models/ai-query-model';

@Injectable({
  providedIn: 'root'
})
export class MainInputService {
  declare public messageAdded: (msg: StoredMessageModel) => void
  declare public mainPage: MainPageComponent;
  declare public setIsTyping: any;

  constructor(
    private service: MessageService,
    private ai: AiService
  ) {}

  sendMessage(content: string, files: number[], pinnedId?: number) {
    if (this.mainPage.roomId === 0) {
      this.sendAi(content);
      return;
    }

    const model = new MessageModel(
      content, User.Id??'', this.mainPage.roomId, files, pinnedId)
    
      this.service.sendMessage(model).subscribe({
        next: response => {
          this.service.getMessage(response).subscribe({
            next: msg => {
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
  private sendAi(query: string) {
      this.setIsTyping("TokuAi");

      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const time = `${hours}:${minutes}`;
    this.messageAdded(new StoredMessageModel(
      0, query, 0, 2, time
    ));
    this.ai.AskAi(new AiQueryModel(query)).subscribe({
      next: response => {
        const content = response.messageContent.trim();

        if (response.time.trim()) {
              this.messageAdded(response);
              this.setIsTyping('');
        }
        else {
          this.setIsTyping('');
          console.error("AI error: ", response);
        }
      },
      error: err => {
        this.setIsTyping('');
        console.error("error in AI request: ", err);
      }
    });
  }

}
