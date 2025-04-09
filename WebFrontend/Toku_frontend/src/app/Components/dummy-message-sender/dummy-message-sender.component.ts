import { NgIf } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dummy-message-sender',
  imports: [NgIf],
  templateUrl: './dummy-message-sender.component.html',
  styleUrl: './dummy-message-sender.component.scss'
})
export class DummyMessageSenderComponent {
  randomLines: number;
  animationDelays: string[] = [];

  constructor() {
    this.randomLines = Math.floor(Math.random() * 3) + 1; // Generate random number between 1 and 3 once
    this.animationDelays = Array.from({ length: 9 }, () => `0.${Math.floor(Math.random() * 10)}s`); // Generate delays for up to 9 elements
  }
}
