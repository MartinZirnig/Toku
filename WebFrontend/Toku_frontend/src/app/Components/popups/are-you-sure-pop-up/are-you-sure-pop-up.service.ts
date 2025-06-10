import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AreYouSurePopUpService {
  private callback: ((result: 'yes' | 'no' | 'update') => void) | null = null;
  message: string = '';
  yesText?: string;
  noText?: string;
  updateText?: string;

  open(
    cb: (result: 'yes' | 'no' | 'update') => void,
    message: string,
    yesText: string = 'Yes',
    noText: string = 'No',
    updateText?: string
  ) {
    this.callback = cb;
    this.message = message;
    this.yesText = yesText;
    this.noText = noText;
    this.updateText = updateText;
  }

  confirm(result: 'yes' | 'no' | 'update') {
    if (this.callback) {
      this.callback(result);
      this.callback = null;
    }
    this.message = '';
    this.yesText = undefined;
    this.noText = undefined;
    this.updateText = undefined;
  }
}
