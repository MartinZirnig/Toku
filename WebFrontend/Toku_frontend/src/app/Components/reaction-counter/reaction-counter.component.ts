import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter, // <-- přidej
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output, // <-- přidej
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ColorManagerService } from '../../services/color-manager.service';
import { ColorSettingsModel } from '../../data_managements/models/color-settings-model';

@Component({
  selector: 'app-reaction-counter',
  templateUrl: './reaction-counter.component.html',
  imports: [NgIf,NgFor, NgStyle],
  styleUrls: ['./reaction-counter.component.scss'],
})
export class ReactionCounterComponent implements OnInit, OnChanges {
  @Input() reactionsData!: string;
  @Output() reactionsDataChange = new EventEmitter<string>();
  @Output() emojiClicked = new EventEmitter<string>();

  @ViewChild('reactionsContainer') reactionsContainer!: ElementRef;
  @ViewChild('allReactionsPopup') allReactionsPopup!: ElementRef;

  reactions: { emoji: string; count: number }[] = [];
  allReactions: { emoji: string; count: number }[] = [];
  showAllReactions = false;
  mouseInPopup = false;
  reactionsvisible = false;
  newReactionIndex: number | null = null;
  hoveredEmojiIndex: number | null = null;
  placeholderPosition: { x: number; y: number } | null = null;
  relativePlaceholderLeft: number = 0;
  relativePlaceholderTop: number = 0;
  private lastReactionsString: string = '';
  private hoverTimeout: any = null;

  // --- pro popup ---
  allReactionsHoveredIndex: number | null = null;
  allReactionsPlaceholderPosition: { x: number; y: number } | null = null;
  allReactionsRelativeLeft: number = 0;
  allReactionsRelativeTop: number = 0;

  public csm: ColorSettingsModel;

  constructor(
    private colorManager: ColorManagerService,
    private el: ElementRef
  ) {
    this.csm = this.colorManager.csm;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reactionsData'] && changes['reactionsData'].currentValue !== undefined) {
      const newReactionsData = changes['reactionsData'].currentValue;
      if (newReactionsData === '' || newReactionsData === null) {
        this.reactionsvisible = false;
        this.lastReactionsString = '';
        this.newReactionIndex = null;
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

  ngAfterViewInit(): void {
    if (!this.csm) return;
    const root = this.el.nativeElement ?? document.documentElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    setVar('--reaction-bg', this.csm.reactionCounterBackground.toRgbaString());
    setVar('--reaction-text', this.csm.reactionCounterText.toRgbaString());
    setVar('--reaction-popup-bg', this.csm.reactionPopupBackground.toRgbaString());
    setVar('--reaction-popup-item-bg', this.csm.reactionPopupItemBackground.toRgbaString());
    setVar('--reaction-popup-item-hover-bg', this.csm.reactionPopupItemHoverBackground.toRgbaString());
    setVar('--reaction-popup-item-text', this.csm.reactionPopupItemText.toRgbaString());
    setVar('--reaction-popup-shadow', this.csm.reactionPopupShadow.toRgbaString());
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

    // Animace pro nový smajlík
    if (this.lastReactionsString && reactionsString.length > this.lastReactionsString.length) {
      // Najdi nový znak
      let newEmoji = '';
      for (let i = 0; i < reactionsString.length; i++) {
        if (this.lastReactionsString[i] !== reactionsString[i]) {
          newEmoji = reactionsString[i];
          break;
        }
      }
      // Najdi index v sorted
      this.newReactionIndex = sorted.findIndex(r => r.emoji === newEmoji);
      // Reset animace po 1s
      setTimeout(() => {
        this.newReactionIndex = null;
      }, 1000);
    } else {
      this.newReactionIndex = null;
    }
    this.lastReactionsString = reactionsString;

    this.allReactions = sorted;
    this.reactions = sorted.length > 3
      ? sorted.slice(0, 3).concat([{ emoji: '...', count: 0 }])
      : sorted;
  }

  onMouseEnter(event: MouseEvent): void {
    if (this.allReactions.length > 3) {
      this.clearHoverTimeout();
      this.hoverTimeout = setTimeout(() => {
        this.showAllReactions = true;
      }, 300);
    }
  }

  onMouseLeave(): void {
    this.clearHoverTimeout();
    setTimeout(() => {
      if (!this.mouseInPopup) {
        this.showAllReactions = false;
      }
    }, 120);
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

  // --- pro hlavní řádek ---
  onEmojiClick(emoji: string, event: MouseEvent): void {
    event.stopPropagation();
    if (emoji !== '...') {
      // pouze emituj změnu, nepřidávej přímo do reactionsData
      this.reactionsDataChange.emit(this.reactionsData + emoji);
      this.emojiClicked.emit(emoji);
      // this.processReactions(this.reactionsData + emoji); // není potřeba, změna přijde přes @Input
    }
  }

  onEmojiMouseEnter(index: number, event: MouseEvent): void {
    if (this.reactions[index]?.emoji === '...') {
      this.hoveredEmojiIndex = null;
      this.placeholderPosition = null;
      return;
    }
    this.hoveredEmojiIndex = index;
    this.placeholderPosition = {
      x: event.clientX + 12,
      y: event.clientY + 8
    };
    this.updateRelativePlaceholderPosition();
  }

  onEmojiMouseMove(event: MouseEvent): void {
    if (this.hoveredEmojiIndex !== null && this.reactions[this.hoveredEmojiIndex]?.emoji !== '...') {
      this.placeholderPosition = {
        x: event.clientX + 12,
        y: event.clientY + 8
      };
      this.updateRelativePlaceholderPosition();
    }
  }

  onEmojiMouseLeave(): void {
    this.hoveredEmojiIndex = null;
    this.placeholderPosition = null;
  }

  // --- pro popup ---
  onAllReactionClick(emoji: string, event: MouseEvent): void {
    event.stopPropagation();
    // pouze emituj změnu, nepřidávej přímo do reactionsData
    this.reactionsDataChange.emit(this.reactionsData + emoji);
    this.emojiClicked.emit(emoji);
    // this.processReactions(this.reactionsData + emoji); // není potřeba, změna přijde přes @Input
  }

  onAllReactionMouseEnter(index: number, event: MouseEvent): void {
    this.allReactionsHoveredIndex = index;
    this.allReactionsPlaceholderPosition = {
      x: event.clientX + 12,
      y: event.clientY + 8
    };
    this.updateAllReactionsRelativePosition();
  }

  onAllReactionMouseMove(event: MouseEvent): void {
    if (this.allReactionsHoveredIndex !== null) {
      this.allReactionsPlaceholderPosition = {
        x: event.clientX + 12,
        y: event.clientY + 8
      };
      this.updateAllReactionsRelativePosition();
    }
  }

  onAllReactionMouseLeave(): void {
    this.allReactionsHoveredIndex = null;
    this.allReactionsPlaceholderPosition = null;
  }

  updateRelativePlaceholderPosition(): void {
    if (!this.placeholderPosition || !this.reactionsContainer) {
      this.relativePlaceholderLeft = 0;
      this.relativePlaceholderTop = 0;
      return;
    }
    const rect = this.reactionsContainer.nativeElement.getBoundingClientRect();
    this.relativePlaceholderLeft = this.placeholderPosition.x - rect.left;
    this.relativePlaceholderTop = this.placeholderPosition.y - rect.top;
  }

  updateAllReactionsRelativePosition(): void {
    if (!this.allReactionsPlaceholderPosition || !this.allReactionsPopup) {
      this.allReactionsRelativeLeft = 0;
      this.allReactionsRelativeTop = 0;
      return;
    }
    const rect = this.allReactionsPopup.nativeElement.getBoundingClientRect();
    this.allReactionsRelativeLeft = this.allReactionsPlaceholderPosition.x - rect.left;
    this.allReactionsRelativeTop = this.allReactionsPlaceholderPosition.y - rect.top;
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
    this.clearHoverTimeout();
    this.showAllReactions = true;
  }

  onPopupMouseLeave(): void {
    this.mouseInPopup = false;
    setTimeout(() => {
      if (!this.mouseInPopup) {
        this.showAllReactions = false;
      }
    }, 120);
  }

  private clearHoverTimeout() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  }

  // Animace a styly jsou nyní řešeny v SCSS.
}
