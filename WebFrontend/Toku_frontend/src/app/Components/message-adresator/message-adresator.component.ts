import { NgClass, NgIf } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild, HostListener } from '@angular/core';
import { MenuService } from '../../services/menu.service'; // Ensure the correct path to MenuService
import { PopUpService } from '../../services/pop-up.service'; // Import the popup service
import { ReactionCounterComponent } from '../reaction-counter/reaction-counter.component';
import { EmojiPopupService } from '../../services/emoji-popup.service'; // Import EmojiPopupService
import { FileDownloadPopupService } from '../../services/file-download-popup.service'; // Import new service
import { ContextMenuMessagesService } from '../../services/context-menu-messages.service';
import { ProfilePictureCircledComponent } from '../profile-picture-circled/profile-picture-circled.component';
import { ReplyService } from '../../services/reply.service'; // Přidej import

@Component({
  selector: 'app-message-adresator',
  templateUrl: './message-adresator.component.html',
  styleUrls: ['./message-adresator.component.scss'],
  imports: [NgIf, NgClass, ReactionCounterComponent, ProfilePictureCircledComponent],
})
export class MessageAdresatorComponent implements OnInit {
  @Input() text!: string;
  @Input() image!: string | null;
  @Input() time!: string;
  @Input() previewText!: string | null; // New input for preview text
  @Input() hasFile: boolean = false; // New input to indicate if the previous message has a file
  @Input() onDeleteMessage!: () => void; // Callback to notify parent component about deletion
  @Input() reactionsData: string = 'j'; // Input for reaction data
  @Input() fileCount: number = 0;
  @Input() fileTotalSize: number = 0;
  @Input() adresatorPicture?: string; // <-- přidáno pro avatar obrázek
  @Input() messageId?: number; // změň na number, pokud to jde
  @Input() raw?: { messageId: number }; // přidej tento input

  @ViewChild('menuTrigger', { static: false }) menuTrigger!: ElementRef;
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  menuVisible = false;
  isLongText = false;
  private hasAnimated = false;
  menuX: number = 0;
  menuY: number = 0;

  constructor(
    private menuService: MenuService,
    private popupService: PopUpService,
    private emojiPopupService: EmojiPopupService,
    private fileDownloadPopupService: FileDownloadPopupService,
    private contextMenuMessagesService: ContextMenuMessagesService,
    private replyService: ReplyService // Přidej reply service
  ) {}

  ngOnInit(): void {
    this.isLongText = this.text.length > 50; // Adjust threshold as needed
  }

  ngAfterViewInit(): void {
    if (this.messageContainer && !this.hasAnimated) {
      this.messageContainer.nativeElement.classList.add('message-appear');
      this.hasAnimated = true;
      setTimeout(() => {
        if (this.messageContainer) {
          this.messageContainer.nativeElement.classList.remove('message-appear');
        }
      }, 500);
    }
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    let x = event.clientX;
    let y = event.clientY;
    if (this.menuTrigger && this.menuTrigger.nativeElement) {
      const rect = this.menuTrigger.nativeElement.getBoundingClientRect();
      x = rect.right;
      y = rect.bottom;
    }
    this.contextMenuMessagesService.open({
      x,
      y,
      showEdit: false,
      showReply: true,
      actions: {
        delete: () => this.onDelete(),
        react: () => this.onReact(),
        copy: () => this.copyToClipboard(),
        reply: () => this.onReply(),
        onDeleteMessage: this.onDeleteMessage // <-- přidej callback
      },
      messageId: this.raw?.messageId // musí být číslo a nesmí být undefined!
    } as any);
  }

  onRightClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuMessagesService.open({
      x: event.clientX,
      y: event.clientY,
      showEdit: false,
      showReply: true,
      actions: {
        delete: () => this.onDelete(),
        react: () => this.onReact(),
        copy: () => this.copyToClipboard(),
        reply: () => this.onReply(),
        onDeleteMessage: this.onDeleteMessage // <-- přidej callback
      },
      messageId: this.raw?.messageId // musí být číslo a nesmí být undefined!
    } as any);
  }

  onEdit(): void {

  }

  onDelete(): void {
    // Nevolat mazání na serveru ani lokálně zde!
    // Mazání řeší context-menu-messages.component.ts po úspěchu z API
  }

  copyToClipboard(): void {
    if (this.text) {
      navigator.clipboard.writeText(this.text).then(() => {
        this.popupService.showMessage('Zkopírováno', 1000, '#1d2f47','#ffffff'); // Show popup message
      }).catch(err => {
        console.error('Failed to copy message to clipboard:', err);
      });
    }
  }

  onReact(): void {
    this.emojiPopupService.openForReaction((emoji: string) => {
      this.reactionsData += emoji;
    });
  }

  onFilesPreviewClick(): void {
    this.fileDownloadPopupService.open();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onReply(): void {
    // Nastav reply service s náhledem na tuto zprávu
    this.replyService.setReply({
      text: this.text,
      previewText: this.previewText,
      hasFile: this.hasFile,
      image: this.image
    });
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: MouseEvent): void {
    if (
      this.menuTrigger &&
      !this.menuTrigger.nativeElement.contains(event.target)
    ) {
      this.menuVisible = false; // Close the menu if clicked outside
      this.menuService.closeMenu();
    }
  }
}