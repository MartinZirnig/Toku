import { NgClass, NgIf } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { MenuService } from '../../../services/menu.service'; // Ensure the correct path to MenuService
import { PopUpService } from '../../../services/pop-up.service'; // Import the popup service
import { ReactionCounterComponent } from '../../reaction-counter/reaction-counter.component';
import { EmojiPopupService } from '../../../services/emoji-popup.service'; // Import EmojiPopupService
import { FileDownloadPopupService } from '../../../services/file-download-popup.service'; // Import new service
import { ContextMenuMessagesService } from '../../../services/context-menu-messages.service';
import { ProfilePictureCircledComponent } from '../../profile-picture-circled/profile-picture-circled.component';
import { ReplyService } from '../../../services/reply.service';
import { FormatedTextComponent } from "../formated-text/formated-text.component";
import { ColorManagerService } from '../../../services/color-manager.service';
import { ColorSettingsModel } from '../../../data_managements/models/color-settings-model';
import { MessageService } from '../../../data_managements/services/message.service';

@Component({
  selector: 'app-message-adresator',
  templateUrl: './message-adresator.component.html',
  styleUrls: ['./message-adresator.component.scss'],
  imports: [NgIf, NgClass, ReactionCounterComponent, ProfilePictureCircledComponent, FormatedTextComponent],
})
export class MessageAdresatorComponent implements OnInit {
  @Input() text!: string;
  @Input() image!: string | null;
  @Input() time!: string;
  @Input() previewText!: string | null; // New input for preview text
  @Input() hasFile: boolean = false; // New input to indicate if the previous message has a file
  @Input() onDeleteMessage!: () => void; // Callback to notify parent component about deletion
  @Input() reactionsData: string = ''; // Input for reaction data
  @Input() fileCount: number = 0;
  @Input() fileTotalSize: number = 0;
  @Input() adresatorPicture?: string; // <-- přidáno pro avatar obrázek
  @Input() messageId?: number; // změň na number, pokud to jde
  @Input() raw?: any; // přidej tento input

  @ViewChild('menuTrigger', { static: false }) menuTrigger!: ElementRef;
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  menuVisible = false;
  isLongText = false;
  private hasAnimated = false;
  menuX: number = 0;
  menuY: number = 0;
  public csm: ColorSettingsModel;
  showFullText = false;
  readonly MAX_TEXT_LENGTH = 600;

  constructor(
    private menuService: MenuService,
    private popupService: PopUpService,
    private emojiPopupService: EmojiPopupService,
    private fileDownloadPopupService: FileDownloadPopupService,
    private contextMenuMessagesService: ContextMenuMessagesService,
    private replyService: ReplyService, // Přidej reply service
    private colorManager: ColorManagerService,
    private el: ElementRef,
    private messageService: MessageService
  ) {
    this.csm = this.colorManager.csm;
  }

  ngOnInit(): void {
    if (this.image)
      console.log(this.image);

    this.isLongText = this.text.length > 50; // Adjust threshold as needed
    this.showFullText = false;

    if (this.hasFile && !this.previewText)
      this.previewText = " ";
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
    setVar('--msg-adresator-bg', this.csm.messageAdresatorBackground.toRgbaString());
    setVar('--msg-preview-bg', this.csm.messagePreviewBackground.toRgbaString());
    setVar('--msg-adresator-text', this.csm.messageAdresatorText.toRgbaString());
    setVar('--msg-preview-text', this.csm.messagePreviewText.toRgbaString());
    setVar('--msg-status-icon', this.csm.messageStatusIcon.toRgbaString());
    setVar('--msg-file-preview-bg', this.csm.messageFilePreviewBackground.toRgbaString());
    setVar('--msg-file-preview-text', this.csm.messageFilePreviewText.toRgbaString());
    setVar('--msg-file-preview-icon', this.csm.messageFilePreviewIcon.toRgbaString());
    setVar('--msg-placeholder', this.csm.messagePlaceholder.toRgbaString());
    // ...další barvy dle potřeby...
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
      messageId: this.raw?.raw.messageId // musí být číslo a nesmí být undefined!
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
      messageId: this.raw?.raw.messageId // musí být číslo a nesmí být undefined!
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

  onReply(): void {
    // Nastav reply service s náhledem na tuto zprávu
    this.replyService.setReply({
      text: this.text,
      previewText: this.previewText,
      hasFile: this.hasFile,
      image: this.image,
      Id: this.raw.raw.messageId
    });
  }

  onReactionEmojiClicked(emoji: string) {
    // NEPŘIDÁVEJ zde emoji do reactionsData!
    // this.reactionsData += emoji;
    // případně zde zavolejte update na serveru, pokud je potřeba
  }

  onReactionsDataChange(newValue: string) {
    this.reactionsData = newValue;
    // případně zde zavolejte update na serveru, pokud je potřeba
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