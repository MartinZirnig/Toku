import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeletePopupService {
  private _visible$ = new BehaviorSubject<boolean>(false);
  private _resolve: ((result: 'me' | 'all' | 'close') => void) | null = null;
  messageId: string | null = null;

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

  confirm(type: 'me' | 'all') {
    this._visible$.next(false);
    if (this._resolve) {
      this._resolve(type);
      this._resolve = null;
    }
    this.messageId = null;
  }
}
