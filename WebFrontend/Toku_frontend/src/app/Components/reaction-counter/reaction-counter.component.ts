import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-reaction-counter',
  templateUrl: './reaction-counter.component.html',
  imports: [NgIf,NgFor],
  styleUrls: ['./reaction-counter.component.scss'],
})
export class ReactionCounterComponent implements OnInit, OnChanges {
  @Input() reactionsData!: string;

  @ViewChild('reactionsContainer') reactionsContainer!: ElementRef;
  @ViewChild('allReactionsPopup') allReactionsPopup!: ElementRef;

  reactions: { emoji: string; count: number }[] = [];
  allReactions: { emoji: string; count: number }[] = [];
  showAllReactions = false;
  mouseInPopup = false;
  reactionsvisible = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reactionsData'] && changes['reactionsData'].currentValue !== undefined) {
      const newReactionsData = changes['reactionsData'].currentValue;
      if (newReactionsData === '' || newReactionsData === null) {
        this.reactionsvisible = false;
      } else {
        this.reactionsvisible = true;
        this.processReactions(newReactionsData);
      }
    }
  }

  ngOnInit(): void {
    // Initial setup if needed
    if (this.reactionsData) {
      this.reactionsvisible = true;
      this.processReactions(this.reactionsData);
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
      setTimeout(() => {
        this.showAllReactions = true;
      }, 500);
    }
  }

  onMouseLeave(): void {
    setTimeout(() => {
      this.showAllReactions = false;
    }, 500.5);
  }

  handleMouseLeave(): void {
    if (this.mouseInPopup) {
      setTimeout(() => {
        if (!this.mouseInPopup) {
          this.showAllReactions = false;
        }
      }, 501);
    }
  }

  handleClick(event: MouseEvent): void {
    if (this.allReactions.length > 3) {
      this.showAllReactions = !this.showAllReactions;
    }
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
  }

  onPopupMouseLeave(): void {
    this.mouseInPopup = false;
  }
}
