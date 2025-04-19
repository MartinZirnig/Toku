import { NgIf, NgClass, NgStyle } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { MenuService } from '../../services/menu.service'; // Ensure the correct path to MenuService
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // Import DomSanitizer
import { NgModel, FormsModule } from '@angular/forms'; // Import FormsModule for two-way binding
import { EmojiPopUpOpenService } from '../../services/emoji-pop-up-open.service'; // Import the emoji popup service

@Component({
  selector: 'app-message',
  templateUrl: './message_sender.component.html',
  styleUrls: ['./message_sender.component.scss'],
  imports: [NgIf, NgClass, FormsModule, NgStyle], // Add FormsModule
})
export class Message_senderComponent implements OnInit {
  @Input() text!: string; // Ensure this is declared only once
  @Input() image!: string | null;
  @Input() time!: string;
  @Input() status!: 'undelivered' | 'delivered' | 'read';
  @Input() previewText!: string | null; // New input for preview text
  @Input() hasFile: boolean = false; // New input to indicate if the previous message has a file
  @Input() timeStamp!: string | null; // New input for timestamp
  @Input() reaction: string = '👌';
  @Input() onDeleteMessage!: () => void; // Callback to notify parent component about deletion

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

  emojiPopupVisible = false;
  emojiPopupPosition = { x: 0, y: 0 };

  constructor(private menuService: MenuService, private sanitizer: DomSanitizer, private emojiPopUp: EmojiPopUpOpenService) {} // Inject DomSanitizer

  private startX = 0; // Initial position
  private currentX = 0; // Current position
  private isDragging = false; // Dragging state

  ngOnInit(): void {
    console.log('Message initialized:', { text: this.text, image: this.image, time: this.time, status: this.status, previewText: this.previewText, hasFile: this.hasFile, timeStamp: this.timeStamp });
    this.isLongText = this.text.length > 50; // Adjust threshold as needed
    const truncatedText = this.getTruncatedPreviewText(this.previewText, 10); // Limit preview to 10 words
    this.formattedPreviewText = this.sanitizer.bypassSecurityTrustHtml(this.applyGradientToLastCharacters(truncatedText, 10)); // Apply gradient to last 10 characters
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
    event.stopPropagation(); // Prevent event propagation
    if (this.menuVisible) {
      this.menuVisible = false;
      this.menuService.closeMenu(); // Notify service to close all menus
    } else {
      this.menuService.closeMenu(); // Close other menus
      this.menuVisible = true;
      this.menuService.setActiveMenu(this); // Set this menu as active
    }
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
    event.preventDefault(); // Prevent the default context menu
    event.stopPropagation(); // Stop event propagation
    this.menuService.closeMenu(); // Close other menus
    this.menuVisible = true; // Open the context menu
    this.menuService.setActiveMenu(this); // Set this menu as active
    console.log('Right-click menu opened'); // Debug log
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
  }

  private processUpdatedText(newText: string): void {
    console.log('Updated text:', newText); // Log the new text
    this.text = newText; // Update the text property
    this.isLongText = newText.length > 50; // Recalculate if the text is long
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto'; // Reset height to auto
    textarea.style.height = `${textarea.scrollHeight}px`; // Adjust height to fit content
  }

  onDelete(): void {
    console.log('Message deleted:', this.text); // Log the deleted message
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
    alert('Doprava'); // Trigger alert for right swipe
  }

  private onSwipeLeft(): void {
    alert('Doleva'); // Trigger alert for left swipe
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

  onReact(event: MouseEvent): void {
    this.emojiPopUp.openEmojiPopup(); // Open the emoji popup
  }

  closeEmojiPopup(): void {
    this.emojiPopUp.closeEmojiPopup(); // Close the emoji popup
  }

  onEmojiSelected(emoji: string): void {
    console.log('Selected emoji:', emoji);
    this.emojiPopUp.closeEmojiPopup();
  }



  
}
