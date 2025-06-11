import { NgIf, NgClass, NgStyle } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild, ElementRef, Input, input } from '@angular/core';
import { MenuService } from '../../../services/menu.service'; // Ensure the correct path to MenuService
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // Import DomSanitizer
import { NgModel, FormsModule } from '@angular/forms'; // Import FormsModule for two-way binding
import { PopUpService } from '../../../services/pop-up.service'; // Import the popup service
import { EmojiPopupService } from '../../../services/emoji-popup.service'; // Import EmojiPopupService
import { FileDownloadPopupService } from '../../../services/file-download-popup.service';
import { ContextMenuMessagesService } from '../../../services/context-menu-messages.service';
import { ReplyService } from '../../../services/reply.service'; // Přidej import
import { DeletePopupService } from '../../popups/delete-popup/delete-popup.service'; // Import DeletePopupService
import { ColorManagerService } from '../../../services/color-manager.service'; // Přidej import

import { ReactionCounterComponent} from '../../reaction-counter/reaction-counter.component'; 
import { EmojisPopUpComponent } from '../../popups/emojis-pop-up/emojis-pop-up.component';
import { ContextMenuMessagesComponent } from '../../contextMenus/context-menu-messages/context-menu-messages.component';

import { MessageControllService } from '../../../data_managements/control-services/message-controll.service';
import { StoredMessageModel } from '../../../data_managements/models/stored-message-model';
import { FormatedTextComponent } from "../formated-text/formated-text.component";

import { ColorSettingsModel } from '../../../data_managements/models/color-settings-model';
import { User } from '../../../data_managements/user';
import { MessageService } from '../../../data_managements/services/message.service';
import { MessagerService } from '../../../data_managements/messager.service';

@Component({
  selector: 'app-message',
  templateUrl: './message_sender.component.html',
  styleUrls: ['./message_sender.component.scss'],
  imports: [NgIf, NgClass, FormsModule, NgStyle, ReactionCounterComponent, FormatedTextComponent],
})
export class 
Message_senderComponent implements OnInit {
  @Input() text!: string; // Ensure this is declared only once
  @Input() image!: string | null;
  @Input() time!: string;
  @Input() status!: 'undelivered' | 'delivered' | 'read';
  @Input() previewText!: string | null; // New input for preview text
  @Input() hasFile: boolean = false; // New input to indicate if the previous message has a file
  @Input() timeStamp!: string | null; // New input for timestamp
  @Input() reaction: string = '';
  @Input() onDeleteMessage!: () => void; // Callback to notify parent component about deletion

  @Input() reactionsData: string = ''; // Input for reaction data

  @Input() declare raw: any;

  @Input() fileCount: number = 0; // Number of files
  @Input() fileTotalSize: number = 0; // Total size in bytes


  @ViewChild('menuTrigger') menuTrigger!: ElementRef;
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('areabox') areabox!: ElementRef<HTMLTextAreaElement>; // Add ViewChild for the textarea

  menuVisible = false;
  isLongText = false;
  truncatedPreviewText!: string; // Truncated preview text
  formattedPreviewText!: SafeHtml; // Formatted preview text with gradient effect
  isEditing = false; // Track if the message is in edit mode
  editableText!: string; // Store the editable text
  showReaction: boolean = true; // Track if the reaction menu is visible
  private hasAnimated = false;

  menuX: number = 0;
  menuY: number = 0;

  public csm: ColorSettingsModel;

  showFullText = false; // Přidáno pro zobrazení celé zprávy
  readonly MAX_TEXT_LENGTH = 600; // Nastav limit pro zkrácení

  constructor(
    private menuService: MenuService, 
    private sanitizer: DomSanitizer, 
    
    private msgCtrl: MessageControllService,
    private popupService: PopUpService, // Inject the popup service
    private emojiPopupService: EmojiPopupService, // Inject EmojiPopupService
    private fileDownloadPopupService: FileDownloadPopupService, // Inject new service
    private contextMenuMessagesService: ContextMenuMessagesService,
    private replyService: ReplyService, // Přidej reply service
    private deletePopupService: DeletePopupService, // <-- přidej službu pro delete popup
    private colorManager: ColorManagerService, // Přidej ColorManagerService
    private el: ElementRef, // Přidej ElementRef pro nastavení CSS proměnných
    private messager: MessagerService,
    private messageService: MessageService
  ) {
    this.csm = this.colorManager.csm;
  } // Inject DomSanitizer

  private startX = 0; // Initial position
  private currentX = 0; // Current position
  private isDragging = false; // Dragging state

  ngOnInit(): void {
    this.messager.appendCallback("refresh-statuses", data => this.refreshStatus(data));

    this.isLongText = this.text.length > 50; // Adjust threshold as needed
    const truncatedText = this.getTruncatedPreviewText(this.previewText, 10); // Limit preview to 10 words
    this.formattedPreviewText = this.sanitizer.bypassSecurityTrustHtml(this.applyGradientToLastCharacters(truncatedText, 10)); // Apply gradient to last 10 characters
    window.addEventListener('message-deleted', this.handleMessageDeleted);
    this.showFullText = false; // Výchozí stav

    if (this.hasFile && !this.previewText)
      this.previewText = " ";
  }

  ngOnDestroy(): void {
    window.removeEventListener('message-deleted', this.handleMessageDeleted);
  }

  private handleMessageDeleted = (event: Event) => {
    // Pokud je id zprávy stejné, zavolej callback
    const detail = (event as CustomEvent).detail;
    if (detail && detail.messageId && this.raw?.messageId?.toString() === detail.messageId.toString()) {
      if (this.onDeleteMessage) {
        this.onDeleteMessage();
      }
    }
  };

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

    // Nastav CSS proměnné pro barvy
    if (!this.csm) return;
    const root = this.el.nativeElement ?? document.documentElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    setVar('--msg-card-bg', this.csm.cardBackground.toRgbaString());
    setVar('--msg-sender-bg', this.csm.messageSenderBackground.toRgbaString());
    setVar('--msg-preview-bg', this.csm.messagePreviewBackground.toRgbaString());
    setVar('--msg-sender-text', this.csm.messageSenderText.toRgbaString());
    setVar('--msg-preview-text', this.csm.messagePreviewText.toRgbaString());
    setVar('--msg-status-icon', this.csm.messageStatusIcon.toRgbaString());
    setVar('--msg-status-read-icon', this.csm.messageStatusReadIcon.toRgbaString());
    setVar('--msg-file-preview-bg', this.csm.messageFilePreviewBackground.toRgbaString());
    setVar('--msg-file-preview-text', this.csm.messageFilePreviewText.toRgbaString());
    setVar('--msg-file-preview-icon', this.csm.messageFilePreviewIcon.toRgbaString());
    setVar('--msg-placeholder', this.csm.messagePlaceholder.toRgbaString());
    // ...další barvy dle potřeby...
  }

  private getTruncatedPreviewText(text: string | null, wordLimit: number): string {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : text;
  }

  private applyGradientToLastCharacters(text: string, count: number): string {
    if (text.length <= count) return text; // No gradient if text is too short
    const visiblePart = text.slice(0, -count);
    const gradientPart = text.slice(-count).split('').map((char, index) => {
      const opacity = 1 - (index / count) * 0.8; // Gradually decrease opacity
      return `<span style="opacity: ${opacity};">${char}</span>`;
    }).join('');
    return visiblePart + gradientPart;
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
      showEdit: true,
      showReply: true,
      actions: {
        edit: () => this.onEdit(),
        delete: () => this.onDelete(),
        react: () => this.onReact(),
        copy: () => this.copyToClipboard(),
        reply: () => this.onReply(),
        onDeleteMessage: this.onDeleteMessage // <-- přidej callback
      },
      messageId: this.raw?.raw.messageId
    } as any);
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: MouseEvent): void {
    if (
      this.menuTrigger &&
      !this.menuTrigger.nativeElement.contains(event.target) &&
      !this.messageContainer.nativeElement.contains(event.target)
    ) {
      this.menuVisible = false; // Close the menu if clicked outside
      this.menuService.closeMenu(); // Notify service to close all menus
    }
  }

  onRightClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuMessagesService.open({
      x: event.clientX,
      y: event.clientY,
      showEdit: true,
      showReply: true,
      actions: {
        edit: () => this.onEdit(),
        delete: () => this.onDelete(),
        react: () => this.onReact(),
        copy: () => this.copyToClipboard(),
        reply: () => this.onReply(),
        onDeleteMessage: this.onDeleteMessage // <-- přidej callback
      },
      messageId: this.raw?.raw.messageId
    } as any);
  }

  onReply(): void {
    this.replyService.setReply({
      text: this.text,
      previewText: this.previewText,
      hasFile: this.hasFile,
      image: this.image,
      Id: this.raw.raw.messageId
    });
  }

  private setMenuPosition(event: MouseEvent): void {
    this.menuX = event.clientX - 300;
    this.menuY = event.clientY - 50;
  }

  onEdit(): void {
    this.isEditing = true; // Enable edit mode
    this.editableText = this.text; // Initialize editable text with the current message

    // Use setTimeout to ensure the textarea is rendered before adjusting its size
    setTimeout(() => {
      if (this.areabox) {
        const textareaElement = this.areabox.nativeElement;

        // Calculate width based on text length
        const charWidth = 8; // Approximate width of a character in pixels
        const padding = 16; // Add padding for better appearance
        const calculatedWidth = Math.max(this.text.length * charWidth + padding, 100); // Minimum width of 100px
        textareaElement.style.width = `${calculatedWidth}px`;

        // Adjust height dynamically
        this.adjustTextareaHeight(textareaElement);
      }
    });
  }

  confirmEdit(): void {
    this.processUpdatedText(this.editableText); // Process the updated text
    this.isEditing = false; // Exit edit mode

    this.msgCtrl.updateMessage(
      this.raw.messageId, this.editableText)
      .subscribe({
        next: response => {
          if (!response.success)
            console.warn('failed message update: ', response.description);
        },
        error: err => {
          console.error('server cannot update message: ', err)
        }
      })
  }

  private processUpdatedText(newText: string): void {
    this.text = newText; // Update the text property
    this.isLongText = newText.length > 50; // Recalculate if the text is long
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto'; // Reset height to auto
    textarea.style.height = `${textarea.scrollHeight}px`; // Adjust height to fit content
  }

  onDelete(): void {

    this.msgCtrl.removeMessage(this.raw.messageId)
    .subscribe({
      next: response => {
        if (!response.success)
          console.warn('failed deleting message: ', response.description);
      },
      error: err => {
        console.error('cannot remove on server: ', err);
      }
    })

    if (this.onDeleteMessage) {
      this.onDeleteMessage(); // Notify parent component to remove the message
    }
  }

  onTouchStart(event: TouchEvent): void {
    if (this.menuVisible || this.isEditing) return; // Prevent dragging if the menu is visible or in edit mode
    this.startX = event.touches[0].clientX;
    this.isDragging = true;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging || this.menuVisible || this.isEditing) return; // Prevent dragging if the menu is visible or in edit mode
    this.currentX = event.touches[0].clientX - this.startX;
    this.currentX = Math.max(-50, Math.min(50, this.currentX)); // Restrict movement to ±50px
    this.messageContainer.nativeElement.style.transform = `translateX(${this.currentX}px)`; // Apply transform to the current element
  }

  onTouchEnd(): void {
    if (this.isDragging) {
      if (this.currentX >= 50) {
        this.onSwipeRight();
      } else if (this.currentX <= -50) {
        this.onSwipeLeft();
      }
    }
    this.resetPosition();
  }

  onMouseDown(event: MouseEvent): void {
    if (this.menuVisible || this.isEditing) return; // Prevent dragging if the menu is visible or in edit mode
    this.startX = event.clientX;
    this.isDragging = true;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || this.menuVisible || this.isEditing) return; // Prevent dragging if the menu is visible or in edit mode
    this.currentX = event.clientX - this.startX;
    this.currentX = Math.max(-50, Math.min(50, this.currentX)); // Restrict movement to ±50px
    this.messageContainer.nativeElement.style.transform = `translateX(${this.currentX}px)`; // Apply transform to the current element
  }

  onMouseUp(): void {
    if (this.isDragging) {
      if (this.currentX >= 50) {
        this.onSwipeRight();
      } else if (this.currentX <= -50) {
        this.onSwipeLeft();
      }
    }
    this.resetPosition();
  }

  private onSwipeRight(): void {
    const action = User.RightSwipe; //localStorage.getItem('swipeRightAction') as 'reply' | 'react' | 'copy' | 'delete' | 'edit' | null;
    this.handleSwipeAction(action);
  }

  private onSwipeLeft(): void {
    const action = User.LeftSwipe; //localStorage.getItem('swipeLeftAction') as 'reply' | 'react' | 'copy' | 'delete' | 'edit' | null;
    this.handleSwipeAction(action);
  }

  private handleSwipeAction(action: string | null) {
    switch (action) {
      case 'react':
        this.onReact();
        break;
      case 'reply':
        this.onReply();
        break;
      case 'copy':
        this.copyToClipboard();
        break;
      case 'delete':

      // tohle nefunguje, protože nevím proč tak to prosím oprav
      
        const msgId = this.raw?.messageId?.toString() ?? '';
        const deleteListener = (event: Event) => {
          const detail = (event as CustomEvent).detail;
          if (detail && detail.messageId && detail.messageId.toString() === msgId) {
            if (this.onDeleteMessage) {
              this.onDeleteMessage();
            }
            window.removeEventListener('message-deleted', deleteListener);
          }
        };
        window.addEventListener('message-deleted', deleteListener);
        this.deletePopupService.open(msgId);
        break;
      case 'edit':
        this.onEdit();
        break;
      default:
        this.onReply();
    }
  }

  private resetPosition(): void {
    this.isDragging = false; // Ensure dragging is reset
    this.currentX = 0; // Reset the current position
    this.messageContainer.nativeElement.style.transform = 'translateX(0)'; // Reset transform for the current element
  }

  getTextareaRows(): number {
    const lineHeight = 20; // Approximate line height in pixels
    const containerWidth = this.messageContainer.nativeElement.offsetWidth; // Get the container width dynamically
    const charWidth = 8; // Approximate width of each character in pixels
    const maxCharsPerLine = Math.floor(containerWidth / charWidth); // Calculate max characters per line

    const lines = Math.ceil(this.editableText.length / maxCharsPerLine); // Calculate the number of lines
    return Math.max(lines, 1); // Ensure at least 1 row
  }

  onReact(): void {
    
    this.emojiPopupService.openForReaction((emoji: string) => {
      this.reactionsData += emoji;



      this.messageService.updateMessageReactions((this.raw?.raw.messageId ?? 0), this.reactionsData).subscribe({
        next: response => {
          if (!response.success)
            console.error("cannot update reactions: ", response.description);
        },
        error: err => {
          console.error("cannot update reactions: ", err);
        }
      })
    });
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

  onFilesPreviewClick(): void {
    this.fileDownloadPopupService.messageId = this.raw.raw.messageId;
    this.fileDownloadPopupService.open();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  get displayText(): string {
    if (this.showFullText || this.text.length <= this.MAX_TEXT_LENGTH) {
      return this.text;
    }
    return this.text.slice(0, this.MAX_TEXT_LENGTH) + '...';
  }

  showAllText() {
    this.showFullText = true;
  }

  onReactionEmojiClicked(emoji: string) {
    // NEPŘIDÁVEJ zde emoji do reactionsData!
    // this.reactionsData += emoji;
    // případně zde zavolejte update na serveru, pokud je potřeba
    // např. this.msgCtrl.addReaction(this.raw.messageId, emoji).subscribe(...)
  }

  onReactionsDataChange(newValue: string) {
    this.reactionsData = newValue;
    // případně zde zavolejte update na serveru, pokud je potřeba
    // např. this.msgCtrl.addReaction(this.raw.messageId, newValue).subscribe(...)
  }

  refreshStatus(data: string) {
    this.messageService.getMessageStatus(Number(this.raw.raw.messageId)).subscribe({
      next: response => {
        if (response != null) {
          this.status = StoredMessageModel.getStatus(response);
        } else {
          console.error("cannot refresh status: No response");
        }
      },
      error: err => {
        console.error("cannot refresh status: ", err);
      }
    })
  }
}