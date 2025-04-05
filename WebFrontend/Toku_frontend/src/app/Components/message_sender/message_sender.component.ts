import { NgIf, NgClass, NgStyle } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { MenuService } from '../../services/menu.service'; // Ensure the correct path to MenuService

@Component({
  selector: 'app-message',
  templateUrl: './message_sender.component.html',
  styleUrls: ['./message_sender.component.scss'],
  imports: [NgIf, NgClass]
})
export class Message_senderComponent implements OnInit {
  @Input() text!: string;
  @Input() image!: string | null;
  @Input() time!: string;
  @Input() status!: 'undelivered' | 'delivered' | 'read';

  @ViewChild('menuTrigger', { static: false }) menuTrigger!: ElementRef;
  @ViewChild('messageContainer', { static: false }) messageContainer!: ElementRef;

  menuVisible = false;
  isLongText = false;

  constructor(private menuService: MenuService) {} // Inject the shared service

  private startX = 0; // Initial position
  private currentX = 0; // Current position
  private isDragging = false; // Dragging state

  ngOnInit(): void {
    console.log('Message initialized:', { text: this.text, image: this.image, time: this.time, status: this.status });
    this.isLongText = this.text.length > 50; // Adjust threshold as needed
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
    console.log('Edit clicked');
  }

  onDelete(): void {
    console.log('Delete clicked');
  }

  onTouchStart(event: TouchEvent): void {
    if (this.menuVisible) return; // Prevent dragging if the menu is visible
    this.startX = event.touches[0].clientX;
    this.isDragging = true;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging || this.menuVisible) return; // Prevent dragging if the menu is visible
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
    if (this.menuVisible) return; // Prevent dragging if the menu is visible
    this.startX = event.clientX;
    this.isDragging = true;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || this.menuVisible) return; // Prevent dragging if the menu is visible
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
}
