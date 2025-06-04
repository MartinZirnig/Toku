import { Component, ElementRef, OnInit, ViewChild, HostListener, Renderer2, Input } from '@angular/core';
import { EmojisPopUpComponent } from '../emojis-pop-up/emojis-pop-up.component';
import { NgClass, NgIf, NgStyle } from '@angular/common';

import { MainInputService } from '../../services/main-input.service';
import { GroupReloadService } from '../../services/group-reload.service';
import { EmojiPopupService } from '../../services/emoji-popup.service';
import { FileUploadService } from '../../services/file-upload.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';
import { MessagerService } from '../../data_managements/messager.service';
import { User } from '../../data_managements/user';
import { ReplyService, ReplyPreview } from '../../services/reply.service'; // Přidej import
import { AiService } from '../../data_managements/services/ai-service.service';


@Component({
  selector: 'app-input-ui',
  templateUrl: './input-ui.component.html',
  styleUrls: ['./input-ui.component.scss'], 
  imports: [EmojisPopUpComponent, NgIf, NgClass, FormsModule, ReactiveFormsModule],

})
export class InputUiComponent implements OnInit {
  @Input() userTyping: string | null = '';
  @Input() IsAllowedToWrite: boolean = true;
  @Input() IsAllowedToSendFiles: boolean = true;
  @ViewChild('chatTextarea', { static: false }) textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('customScrollbarThumb', { static: false }) scrollThumb!: ElementRef<HTMLDivElement>;
  @ViewChild('customScrollbarTrack', { static: false }) scrollTrack!: ElementRef<HTMLDivElement>;
  @ViewChild('customScrollbarContainer', { static: false }) scrollContainer!: ElementRef<HTMLDivElement>;

  isDragging = false;
  private mouseMoveListener!: () => void;
  private mouseUpListener!: () => void;
  private animationFrameId: number | null = null;

  hasFiles = false;
  totalFileSize = '';
  fileCount = 0;
  inputControl: FormControl = new FormControl('');
  typing = false;
  
  declare typingTimeout: any;
  declare typingSub: Subscription;

  replyPreview: ReplyPreview | null = null;

  private lastGroupId: string | number | null = null;
  private groupCheckInterval: any;

  constructor(
    private renderer: Renderer2, 
    private service: MainInputService,
    private reloader: GroupReloadService,
    public emojiPopupService: EmojiPopupService,
    private fileUploadService: FileUploadService,
    private messager: MessagerService,
    private replyService: ReplyService // Přidej reply service
  ) {
    // Close emoji popup when clicking outside
    this.renderer.listen('document', 'click', (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#emoji-button') && !target.closest('app-emoji')) {
        this.emojiPopupService.emojiPopupVisible = false;
      }
    });

    this.fileUploadService.files$.subscribe((files) => {
      this.hasFiles = files.length > 0;
      this.fileCount = files.length;
      const totalSizeInBytes = files.reduce((sum, file) => sum + file.size, 0);

      if (totalSizeInBytes < 1024) {
        this.totalFileSize = `${totalSizeInBytes} B`;
      } else if (totalSizeInBytes < 1024 * 1024) {
        this.totalFileSize = `${(totalSizeInBytes / 1024).toFixed(2)} KB`;
      } else if (totalSizeInBytes < 1024 * 1024 * 1024) {
        this.totalFileSize = `${(totalSizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
      } else {
        this.totalFileSize = `${(totalSizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      }
    }); 

    this.typingSub = this.inputControl.valueChanges.subscribe(() => this.handleTyping());

    messager.appendCallback("start-typing", str => {this.userTyping = str})
    messager.appendCallback("stop-typing", str => {this.userTyping = null})
  
    this.replyService.replyPreview$.subscribe(preview => {
      this.replyPreview = preview;
    });
  }

  ngOnInit(): void {
    // Ulož aktuální groupId
    this.lastGroupId = User.ActiveGroupId;

    // Polling na změnu chatu/skupiny
    this.groupCheckInterval = setInterval(() => {
      if (User.ActiveGroupId !== this.lastGroupId) {
        this.lastGroupId = User.ActiveGroupId;
        this.replyService.clearReply();
      }
    }, 300);
  }

  ngAfterViewInit(): void {
    // Ověř, že textarea existuje (IsAllowedToWrite může být false)
    if (this.IsAllowedToWrite && this.textarea) {
      this.setupChatUI();
      this.checkScrollability();
      this.updateScrollThumbPosition();
      this.emojiPopupService.openForInput(this.textarea.nativeElement);
      this.emojiPopupService.emojiPopupVisible = false;
    }
  }

  ngOnDestroy(): void {
    if (this.groupCheckInterval) {
      clearInterval(this.groupCheckInterval);
    }
  }

  setupChatUI(): void {
    // Ověř, že reference existují
    if (!this.textarea || !this.scrollThumb || !this.scrollTrack || !this.scrollContainer) return;
    const pinButton = document.getElementById("pin-button");  
    const sendButton = document.getElementById("send-button");  
    const textarea = this.textarea.nativeElement; 

    if (!pinButton || !sendButton || !textarea) {
      console.error("Některé prvky UI nebyly nalezeny!");
      return;
    }

  }

  checkScrollability(): void {
    if (!this.textarea || !this.scrollContainer || !this.scrollThumb) return;
    const textarea = this.textarea.nativeElement;
    const scrollContainer = this.scrollContainer.nativeElement;
    const scrollThumb = this.scrollThumb.nativeElement;

    // Získání počtu řádků v textarea
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight || "0");
    const rows = Math.floor(textarea.scrollHeight / lineHeight);

    // Zobrazíme scrollbar pouze tehdy, pokud je více než 2 řádky
    if (rows > 2 && textarea.scrollHeight > textarea.clientHeight) {
      scrollContainer.classList.add('scrollable'); // Přidáme třídu pro viditelnost scrollbaru
      scrollThumb.style.opacity = "1"; // Thumb je viditelný
    } else {
      scrollContainer.classList.remove('scrollable'); // Odstraníme třídu, pokud není potřeba
      scrollThumb.style.opacity = "0"; // Thumb je neviditelný
    }
  }

  updateScrollThumbPosition(): void {
    if (!this.textarea || !this.scrollThumb || !this.scrollTrack) return;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId); // Zrušíme předchozí frame, pokud existuje
    }

    this.animationFrameId = requestAnimationFrame(() => {
      const textarea = this.textarea.nativeElement;
      const scrollThumb = this.scrollThumb.nativeElement;
      const scrollTrack = this.scrollTrack.nativeElement;

      const scrollHeight = textarea.scrollHeight;
      const clientHeight = textarea.clientHeight;
      const scrollTop = textarea.scrollTop;

      // Poloměr na ose X a Y (nezměněný)
      const radiusX = scrollTrack.offsetWidth / 2 * 1.2; // Poloměr na ose X
      const radiusY = scrollTrack.offsetHeight / 2 * 0.8; // Poloměr na ose Y

      // Výpočet úhlu na základě scrollTop
      const scrollRatio = scrollTop / (scrollHeight - clientHeight);
      const angle = Math.PI * scrollRatio; // Úhel v radiánech (0 až π)

      // Upravený výpočet pozice thumbu na trajektorii
      const x = radiusX * Math.sin(angle); // X-ová pozice (vodorovný posun)
      const y = -radiusY * Math.cos(angle) + radiusY; // Y-ová pozice (svislý posun)

      // Nastavení pozice thumbu
      scrollThumb.style.transform = `translate(${x}px, ${y}px)`;

      this.animationFrameId = null; // Resetujeme frame ID
    });
  }

  onInput(): void {
    if (!this.textarea || !this.scrollThumb || !this.scrollTrack || !this.scrollContainer) return;
    this.checkScrollability();
    this.updateScrollThumbPosition();
  }

  onScroll(): void {
    if (!this.textarea || !this.scrollThumb || !this.scrollTrack) return;
    this.updateScrollThumbPosition();
  }

  onThumbMouseDown(event: MouseEvent): void {
    if (!this.scrollThumb || !this.scrollTrack) return;
    this.isDragging = true;

    // Add mousemove and mouseup listeners dynamically
    this.mouseMoveListener = this.renderer.listen('document', 'mousemove', this.handleMouseMove);
    this.mouseUpListener = this.renderer.listen('document', 'mouseup', this.onMouseUp);
  }

  handleMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging || !this.scrollTrack || !this.scrollThumb || !this.textarea) return;

    const trackRect = this.scrollTrack.nativeElement.getBoundingClientRect();
    const thumbHeight = this.scrollThumb.nativeElement.offsetHeight;

    // Výpočet nového posunu thumbu
    const thumbOffset = Math.min(
      Math.max(event.clientY - trackRect.top - thumbHeight / 2, 0),
      trackRect.height - thumbHeight
    );
    const scrollRatio = thumbOffset / (trackRect.height - thumbHeight);

    // Aktualizace scrollTop textarea
    this.textarea.nativeElement.scrollTop = scrollRatio * (this.textarea.nativeElement.scrollHeight - this.textarea.nativeElement.clientHeight);
  };

  onMouseUp = (): void => {
    this.isDragging = false;

    // Remove mousemove and mouseup listeners dynamically
    if (this.mouseMoveListener) this.mouseMoveListener();
    if (this.mouseUpListener) this.mouseUpListener();
  };

  @HostListener('window:resize')
  onResize(): void {
    if (!this.textarea || !this.scrollThumb || !this.scrollTrack || !this.scrollContainer) return;
    this.checkScrollability();
    this.updateScrollThumbPosition();
  }

  toggleEmojiPopup(): void {
    this.emojiPopupService.emojiPopupVisible = !this.emojiPopupService.emojiPopupVisible;
  }

  onEmojiSelected(emoji: string): void {
    this.emojiPopupService.insertEmoji(emoji);
  }

  send(): void {
    if (!this.textarea) return;
    const text = this.textarea.nativeElement.value.trim();
    if (!text) return;

    if (this.fileUploadService.any()){
      this.fileUploadService.sendSecretGroup().subscribe({
        next: response => {
            var values = response  
              .filter(rrm => rrm.success)
              .map(rrm => Number(rrm.description))
              .filter(id => !Number.isNaN(id));

            this.service.sendMessage(text ?? '', values);
            this.fileUploadService.clear();
        },
        error: err => {
          console.error("error while sending files:", err);
        }
      })
    }
    else {
            this.service.sendMessage(text ?? '', []);
    }




    this.textarea.nativeElement.value = '';

    // Po odeslání zprávy zruš reply preview
    this.replyService.clearReply();

    setTimeout(() => {
      this.reloader.groupReload();
    }, 1000);
    
  }

  toggleFileForm(): void {
    this.fileUploadService.toggleVisibility();
  }

  handleTyping() {
      if (!this.typing) {
        this.messager.writeSocket(`typing-start ${User.ActiveGroupId}&${User.Name}`);

        this.typing = true;
    }

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
        this.messager.writeSocket(`typing-stop ${User.ActiveGroupId}&${User.Name}`);

      this.typing = false;
    }, 1500);
  }  

  // Přidej možnost zrušit odpověď
  cancelReplyPreview(): void {
    this.replyService.clearReply();
  }

  getReplyPreviewText(): string {
    const txt = this.replyPreview?.text ?? this.replyPreview?.previewText ?? '';
    if (txt.length > 80) {
      return txt.slice(0, 80) + '…';
    }
    return txt;
  }
}
