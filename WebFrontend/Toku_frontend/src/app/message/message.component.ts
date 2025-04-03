import { NgIf, NgClass } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  imports: [NgIf, NgClass]
})
export class MessageComponent implements OnInit {
  @ViewChild('menuTrigger', { static: false }) menuTrigger!: ElementRef;

  message = {
    text: 'This is a sample message dd sample message dd sample message dd sample message dd sample message dd sample message dd sample message dd sample message dd sample message dd sample message dd sample message dd.',
    image: 'ddd', // Replace with a valid image URL or set to null if not needed
    time: '12:38', // Add the time of sending
    status: 'read' // Possible values: 'undelivered', 'delivered', 'read'
  };

  menuVisible = false;
  menuPosition = { x: 0, y: 0 };

  ngOnInit(): void {
    console.log('Message initialized:', this.message);
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    const rect = this.menuTrigger.nativeElement.getBoundingClientRect();
    this.menuPosition = { x: rect.left, y: rect.top + rect.height / 2 }; // Align the right side of the menu with the left side of the three-dot menu
    this.menuVisible = !this.menuVisible;
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: MouseEvent): void {
    this.menuVisible = false;
  }

  onRightClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.menuVisible = true;
  }

  onEdit(): void {
    console.log('Edit clicked');
  }

  onDelete(): void {
    console.log('Delete clicked');
  }
}
