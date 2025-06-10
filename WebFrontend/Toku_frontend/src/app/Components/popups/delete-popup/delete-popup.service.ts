import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from '../../../data_managements/services/message.service';
import { MessageControllService } from '../../../data_managements/control-services/message-controll.service';

@Injectable({ providedIn: 'root' })
export class DeletePopupService {
  private _visible$ = new BehaviorSubject<boolean>(false);
  private _resolve: ((result: 'me' | 'all' | 'close') => void) | null = null;
  messageId: string | null = null;

  constructor(
    private msg: MessageService,
    private msgCtrl: MessageControllService
  ) {

  }

  get visible$() {
    return this._visible$.asObservable();
  }

  open(messageId: string): Promise<'me' | 'all' | 'close'> {
    this.messageId = messageId;
    this._visible$.next(true);
    return new Promise(resolve => {
      this._resolve = resolve;
    });
  }

  close() {
    this._visible$.next(false);
    if (this._resolve) {
      this._resolve('close');
      this._resolve = null;
    }
    this.messageId = null;
  }

  remove() {
    if (!this.messageId) {
      console.error('No message ID provided for deletion.');
      return;
    }
    this.msgCtrl.removeMessage(Number(this.messageId)).subscribe({
      next: (result) => {
        if (result.success) {
          this.confirm('all');
        } else {
          console.error('Failed to remove message:', result.description);
        }
      },
      error: (err) => {
        console.error('Error removing message:', err);
      }
    });
  }
  hide() {
    if (!this.messageId) {
      console.error('No message ID provided for hide.');
      return;
    }
    this.msg.hideMessage(Number(this.messageId)).subscribe({
      next: (result) => {
        if (result.success) {
          this.confirm('me');
        } else {
          console.error('Failed to hide message:', result.description);
        }
      },
      error: (err) => {
        console.error('Error hiding message:', err);
      }
    });
  }


  confirm(type: 'me' | 'all') {
    this._visible$.next(false);
    if (this._resolve) {
      this._resolve(type);
      this._resolve = null;
    }

    this.messageId = null;
  }
}
