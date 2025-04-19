import { Injectable } from '@angular/core';
import { GroupService } from '../services/group-service.service';
import { Observable } from 'rxjs';
import { User } from '../user';
import { StoredMessageModel } from '../models/stored-message-model';
import { MessageModel } from '../models/message-model';

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
}
