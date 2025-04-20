import { Injectable } from '@angular/core';
import { GroupService } from '../services/group-service.service';
import { Observable } from 'rxjs';
import { User } from '../user';
import { StoredMessageModel } from '../models/stored-message-model';
import { MessageModel } from '../models/message-model';
import { RequestResultModel } from '../models/result-model';
import { MessageEditModel } from '../models/message-edit-model';
import { MessageRemoveModel } from '../models/message-remove-model';

@Injectable({
  providedIn: 'root'
})
export class MessageControllService {

  constructor(
  private service: GroupService
  ) {}

  public loadMessages(groupId: number): Observable<Array<StoredMessageModel>> {
    const id = User.Id ?? '';
    return this.service.getMessages(id, groupId);
  }
  public sendMessage(
    content:string, groupId: number, 
    attachedFileId?: number, pinnedMessageId?: number)
    : Observable<number> {
      const model = new MessageModel(
        content, User.Id??'', groupId, attachedFileId, pinnedMessageId
      );
      return this.service.sendMessage(model)
  }
  public updateMessage(messageId: number, content: string) 
  : Observable<RequestResultModel>
  {
    const model = new MessageEditModel(
      User.Id ?? '', messageId, content
    );
    return this.service.updateMessage(model); 
  }

  public removeMessage(messageId: number)
  : Observable<RequestResultModel>
  {
    const model = new MessageRemoveModel(
      User.Id ?? '', messageId
    );

    return this.service.removeMessage(model);
  }
}
