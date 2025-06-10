import { Component, Output, EventEmitter } from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-emoji',
  templateUrl: './emojis-pop-up.component.html',
  styleUrls: ['./emojis-pop-up.component.scss'],
  standalone: true,
  imports: [PickerComponent],
})
export class EmojisPopUpComponent {
  @Output() emojiSelected = new EventEmitter<string>();

  onEmojiClick(event: any): void {
    this.emojiSelected.emit(event.emoji.native);
  }
}







