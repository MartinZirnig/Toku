import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FileDownloadPopupService {
  private _visible$ = new BehaviorSubject<boolean>(false);
  visible$ = this._visible$.asObservable();

  open() {
    this._visible$.next(true);
  }

  close() {
    this._visible$.next(false);
  }
}
