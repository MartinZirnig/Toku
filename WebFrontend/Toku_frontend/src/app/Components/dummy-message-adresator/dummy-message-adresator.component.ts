import { NgIf } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dummy-message-adresator',
  imports: [NgIf],
  templateUrl: './dummy-message-adresator.component.html',
  styleUrl: './dummy-message-adresator.component.scss'
})
export class DummyMessageAdresatorComponent {
  randomLines: number;
  animationDelays: string[] = [];

  constructor() {
    this.randomLines = Math.floor(Math.random() * 3) + 1; // Generate random number between 1 and 3 once
    this.animationDelays = Array.from({ length: 9 }, () => `0.${Math.floor(Math.random() * 10)}s`); // Generate delays for up to 9 elements
  }
}
