import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-emoji',
  templateUrl: './emojis-pop-up.component.html',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmojisPopUpComponent implements AfterViewInit {
  @Output() emojiSelected = new EventEmitter<string>();
  selectedEmoji = '';

  ngAfterViewInit() {
    import('emoji-picker-element');
  }

  onEmojiClick(event: any) {
    this.selectedEmoji = event.detail.unicode;
    this.emojiSelected.emit(this.selectedEmoji);
  }
}


