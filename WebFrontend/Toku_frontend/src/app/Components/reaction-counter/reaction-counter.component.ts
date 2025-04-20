import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-reaction-counter',
  templateUrl: './reaction-counter.component.html',
  imports: [NgIf,NgFor],
  styleUrls: ['./reaction-counter.component.scss'],
})
export class ReactionCounterComponent implements OnChanges {
  @Input() reactionsData!: string;

  @ViewChild('reactionsContainer') reactionsContainer!: ElementRef;
  @ViewChild('allReactionsPopup') allReactionsPopup!: ElementRef;

  reactions: { emoji: string; count: number }[] = [];
  allReactions: { emoji: string; count: number }[] = [];
  showAllReactions = false;
  mouseInPopup = false;
  reactionsvisible = true;
  private popupTimeoutId: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reactionsData']) {
      this.processReactions(this.reactionsData);
    }
    if (this.reactionsData === '' || this.reactionsData === undefined || this.reactionsData === null) {
      this.reactionsvisible = false;
    }
    else {
      this.reactionsvisible = true;
    }
  }

  processReactions(reactionsString: string): void {
    const emojis = Array.from(reactionsString);
    const emojiCounts: { [key: string]: number } = {};

    emojis.forEach((emoji) => {
      emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
    });

    const sorted = Object.entries(emojiCounts)
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count);

    this.allReactions = sorted;
    this.reactions = sorted.length > 3
      ? sorted.slice(0, 3).concat([{ emoji: '...', count: 0 }])
      : sorted;
  }

  getDisplayCount(count: number): string {
    if (count > 9) return '9+';
    if (count <= 1) return '';
    return count.toString();
  }

  onMouseEnter(event: MouseEvent): void {
    if (this.allReactions.length > 3) {
      this.popupTimeoutId = setTimeout(() => {
        this.showAllReactions = true;
        
      }, 500);
    }
  }

  onMouseLeave(): void {
    clearTimeout(this.popupTimeoutId);
    this.popupTimeoutId = setTimeout(() => {
      this.showAllReactions = false;
    }, 150);
  }

  handleMouseLeave(): void {
    // Nastartujeme timer, ale neschováme, dokud neodejde i z popupu
    this.popupTimeoutId = setTimeout(() => {
      if (!this.mouseInPopup) {
        this.showAllReactions = false;
      }
    }, 200);
  }

  handleClick(event: MouseEvent): void {
    this.showAllReactions = !this.showAllReactions;
    
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    if (
      this.reactionsContainer &&
      !this.reactionsContainer.nativeElement.contains(event.target) &&
      this.allReactionsPopup &&
      !this.allReactionsPopup.nativeElement.contains(event.target)
    ) {
      this.showAllReactions = false;
    }
  }

onPopupMouseEnter(): void {
  this.mouseInPopup = true;
  if (this.popupTimeoutId) {
    clearTimeout(this.popupTimeoutId);
  }
}

onPopupMouseLeave(): void {
  this.mouseInPopup = false;
  this.popupTimeoutId = setTimeout(() => {
    this.showAllReactions = false;
  }, 200);
}

  
}
