import { NgClass, NgIf } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild, HostListener } from '@angular/core';
import { MenuService } from '../../services/menu.service'; // Ensure the correct path to MenuService
import { PopUpService } from '../../services/pop-up.service'; // Import the popup service
import { ReactionCounterComponent } from '../reaction-counter/reaction-counter.component';
import { EmojiPopupService } from '../../services/emoji-popup.service'; // Import EmojiPopupService
import { FileDownloadPopupService } from '../../services/file-download-popup.service'; // Import new service

@Component({
  selector: 'app-message-adresator',
  templateUrl: './message-adresator.component.html',
  styleUrls: ['./message-adresator.component.scss'],
  imports: [NgIf, NgClass,ReactionCounterComponent],
})
export class MessageAdresatorComponent implements OnInit {
  @Input() text!: string;
  @Input() image!: string | null;
  @Input() time!: string;
  @Input() previewText!: string | null; // New input for preview text
  @Input() hasFile: boolean = false; // New input to indicate if the previous message has a file
  @Input() onDeleteMessage!: () => void; // Callback to notify parent component about deletion
  @Input() reactionsData!: string; // Input for reaction data
  @Input() fileCount: number = 0;
  @Input() fileTotalSize: number = 0;

  @ViewChild('menuTrigger', { static: false }) menuTrigger!: ElementRef;
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  menuVisible = false;
  isLongText = false;
  private hasAnimated = false;

  constructor(
    private menuService: MenuService,
    private popupService: PopUpService,
    private emojiPopupService: EmojiPopupService, // Inject EmojiPopupService
    private fileDownloadPopupService: FileDownloadPopupService // Inject new service
  ) {}

  ngOnInit(): void {
    console.log('Message initialized:', { text: this.text, image: this.image, time: this.time, previewText: this.previewText, hasFile: this.hasFile });
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

  onRightClick(event: MouseEvent): void {
    event.preventDefault(); // Prevent the default context menu
    event.stopPropagation(); // Stop event propagation
    this.menuService.closeMenu(); // Close other menus
    this.menuVisible = true; // Open the context menu
    this.menuService.setActiveMenu(this); // Set this menu as active
    console.log('Right-click menu opened'); // Debug log
  }

  onEdit(): void {
    console.log('Edit action triggered'); // Add your edit logic here
  }

  onDelete(): void {
    console.log('Message deleted:', this.text); // Log the deleted message
    if (this.onDeleteMessage) {
      this.onDeleteMessage(); // Notify parent component to remove the message
    }
  }

  copyToClipboard(): void {
    if (this.text) {
      navigator.clipboard.writeText(this.text).then(() => {
        console.log('Message copied to clipboard:', this.text);
        this.popupService.showMessage('Zkopírováno', 1000, '#1d2f47','#ffffff'); // Show popup message
      }).catch(err => {
        console.error('Failed to copy message to clipboard:', err);
      });
    }
  }

  onReact(): void {
    this.emojiPopupService.openForReaction((emoji: string) => {
      this.reactionsData += emoji; // Append the selected emoji to reactionsData
      console.log('Emoji added to reactionsData:', emoji);
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

  @HostListener('document:click', ['$event'])
  closeMenu(event: MouseEvent): void {
    if (
      this.menuTrigger &&
      !this.menuTrigger.nativeElement.contains(event.target)
    ) {
      this.menuVisible = false; // Close the menu if clicked outside
      this.menuService.closeMenu(); // Notify service to close all menus
      console.log('Menu closed'); // Debug log
    }
  }
}
