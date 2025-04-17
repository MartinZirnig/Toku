import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmojiPopUpOpenService {

  public emojiPopupVisible = false; // This property will control the visibility of the emoji popup
  public emojiSelected = ''; // This property will store the selected emoji
  constructor() { }

  public openEmojiPopup(): void {
    this.emojiPopupVisible = true; // Set the emoji popup visibility to true
  }
  public closeEmojiPopup(): void {
    this.emojiPopupVisible = false; // Set the emoji popup visibility to false
  }
}
