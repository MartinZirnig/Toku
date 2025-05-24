import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EmojiPopupService {
  private _emojiPopupVisible = false;
  private _reactionCallback: ((emoji: string) => void) | null = null;
  private _targetElement: HTMLTextAreaElement | null = null; // For input context
  private _mode: 'input' | 'reaction' = 'input'; // Mode to differentiate behavior

  get emojiPopupVisible(): boolean {
    return this._emojiPopupVisible;
  }

  set emojiPopupVisible(visible: boolean) {
    this._emojiPopupVisible = visible;
  }

  get targetElement(): HTMLTextAreaElement | null {
    return this._targetElement;
  }

  set targetElement(element: HTMLTextAreaElement | null) {
    this._targetElement = element;
  }

  openForInput(targetElement: HTMLTextAreaElement): void {
    this._mode = 'input';
    this._targetElement = targetElement;
    this._emojiPopupVisible = true;
  }

  openForReaction(callback: (emoji: string) => void): void {
    this._mode = 'reaction';
    this._reactionCallback = callback;

    setTimeout(() => this._emojiPopupVisible = true, 5); // Ensure the popup opens after the current event loop 
  }

  insertEmoji(emoji: string): void {
    if (this._mode === 'reaction' && this._reactionCallback) {
      this._reactionCallback(emoji);
      this._reactionCallback = null; // Reset callback after use
    } else if (this._mode === 'input' && this._targetElement) {
      this._targetElement.value += emoji; // Insert emoji into the target element
    }

    this._emojiPopupVisible = false;
  }
}
