import { Component, ElementRef, OnInit, ViewChild, HostListener, Renderer2 } from '@angular/core';
import {
  buttonBackground,
  buttonHoverBackground,
  textColor,
  placeholderColor,
  textareaBackground,
  textareaFocusBackground,
  iconColor,
  iconHoverColor,
  pinButtonBackground,
  sendButtonBackground,
  pinButtonHoverBackground,
  sendButtonHoverBackground,
} from '../../services/colors.service';
import { EmojisPopUpComponent } from '../emojis-pop-up/emojis-pop-up.component';
import { NgIf } from '@angular/common';
import { EmojiPopUpOpenService } from '../../services/emoji-pop-up-open.service';
import { GroupService } from '../../data_managements/services/group-service.service';
import { MainInputService } from '../../services/main-input.service';
import { GroupReloadService } from '../../services/group-reload.service';

@Component({
  selector: 'app-input-ui',
  templateUrl: './input-ui.component.html',
  styleUrls: ['./input-ui.component.scss'], 
  imports: [EmojisPopUpComponent,NgIf]
})
export class InputUiComponent implements OnInit {
  @ViewChild('chatTextarea', { static: true }) textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('customScrollbarThumb', { static: true }) scrollThumb!: ElementRef<HTMLDivElement>;
  @ViewChild('customScrollbarTrack', { static: true }) scrollTrack!: ElementRef<HTMLDivElement>;
  @ViewChild('customScrollbarContainer', { static: true }) scrollContainer!: ElementRef<HTMLDivElement>;

  isDragging = false;
  private mouseMoveListener!: () => void;
  private mouseUpListener!: () => void;
  private animationFrameId: number | null = null;

  constructor(
    private renderer: Renderer2, 
    public emojiPopUp: EmojiPopUpOpenService,
    private service: MainInputService,
    private reloader: GroupReloadService
  ) {}

  ngOnInit(): void {
    this.setupChatUI();
    this.checkScrollability();
    this.updateScrollThumbPosition();
  }

  setupChatUI(): void {
    const pinButton = document.getElementById("pin-button");  
    const sendButton = document.getElementById("send-button");  
    const textarea = this.textarea.nativeElement; 

    if (!pinButton || !sendButton || !textarea) {
      console.error("Některé prvky UI nebyly nalezeny!");
      return;
    }

    // Nastavení barev pro tlačítka
    pinButton.style.backgroundColor = pinButtonBackground;
    pinButton.style.color = iconColor;
    sendButton.style.backgroundColor = sendButtonBackground;
    sendButton.style.color = iconColor;

    // Nastavení barev pro textarea
    textarea.style.backgroundColor = textareaBackground;
    textarea.style.color = textColor;
    textarea.style.setProperty("--placeholder-color", placeholderColor); // Placeholder barva

    // Hover efekty pro tlačítka
    pinButton.addEventListener("mouseenter", () => {
      pinButton.style.backgroundColor = pinButtonHoverBackground;
      pinButton.style.color = iconHoverColor;
    });
    pinButton.addEventListener("mouseleave", () => {
      pinButton.style.backgroundColor = pinButtonBackground;
      pinButton.style.color = iconColor;
    });

    sendButton.addEventListener("mouseenter", () => {
      sendButton.style.backgroundColor = sendButtonHoverBackground;
      sendButton.style.color = iconHoverColor;
    });
    sendButton.addEventListener("mouseleave", () => {
      sendButton.style.backgroundColor = sendButtonBackground;
      sendButton.style.color = iconColor;
    });

    // Focus efekt pro textarea
    textarea.addEventListener("focus", () => {
      textarea.style.backgroundColor = textareaFocusBackground;
    });
    textarea.addEventListener("blur", () => {
      textarea.style.backgroundColor = textareaBackground;
    });
  }

  checkScrollability(): void {
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
      const radiusX = scrollTrack.offsetWidth / 2; // Poloměr na ose X
      const radiusY = scrollTrack.offsetHeight / 2 * 0.75; // Poloměr na ose Y

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
    this.checkScrollability();
    this.updateScrollThumbPosition();
  }

  onScroll(): void {
    this.updateScrollThumbPosition();
  }

  onThumbMouseDown(event: MouseEvent): void {
    this.isDragging = true;

    // Add mousemove and mouseup listeners dynamically
    this.mouseMoveListener = this.renderer.listen('document', 'mousemove', this.handleMouseMove);
    this.mouseUpListener = this.renderer.listen('document', 'mouseup', this.onMouseUp);
  }

  handleMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging) return;

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
    this.checkScrollability();
    this.updateScrollThumbPosition();
  }

  onEmojiSelected(emoji: string): void {
    console.log('Selected emoji:', emoji);
    
  }

  send(): void {
    const text = this.textarea.nativeElement.value.trim();
    if (!text) return;
    this.service.sendMessage(text ?? '');
    this.textarea.nativeElement.value = '';

    setTimeout(() => {
    this.reloader.groupReload();
    }, 1000);
  }
}
