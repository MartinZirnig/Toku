import { NgClass, NgIf } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild, HostListener } from '@angular/core';
import { MenuService } from '../../services/menu.service'; // Ensure the correct path to MenuService
import { ReactionCounterComponent } from '../reaction-counter/reaction-counter.component';

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
  @Input() onDeleteMessage!: () => void; // Callback to notify parent component about deletion
  @Input() reactionsData!: string; // Input for reaction data

  @ViewChild('menuTrigger', { static: false }) menuTrigger!: ElementRef;

  menuVisible = false;
  isLongText = false;

  constructor(private menuService: MenuService) {} // Inject the shared service

  ngOnInit(): void {
    console.log('Message initialized:', { text: this.text, image: this.image, time: this.time });
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
