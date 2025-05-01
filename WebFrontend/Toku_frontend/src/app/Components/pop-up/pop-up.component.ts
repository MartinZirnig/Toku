import { NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PopUpService } from '../../services/pop-up.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pop-up',
  imports: [NgIf],
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.scss'
})
export class PopUpComponent implements OnInit, OnDestroy {
  isVisible: boolean = false;
  progress: number = 100;
  truncatedMessage: string = '';
  backgroundColor: string = '#3b82f6'; // Default background color
  textColor: string = '#ffffff'; // Default text color
  darkerBackgroundColor: string = '#1e40af'; // Default darker background color
  progressColor: string = '#93c5fd'; // Default progress bar color
  private subscriptions: Subscription = new Subscription();

  constructor(private popUpService: PopUpService) {}

  ngOnInit(): void {
    
    this.subscriptions.add(
      this.popUpService.message$.subscribe((message) => {
        if (message) {
          this.showPopUp(message);
        }
      })
    );
  }

  private showPopUp(message: string, backgroundColor: string = '#3b82f6', textColor: string = '#ffffff'): void {
    this.isVisible = true;
    this.progress = 100;
    this.truncatedMessage = this.getTruncatedMessageWithGradient(message, 50, 5);
    this.backgroundColor = backgroundColor;
    this.textColor = textColor;
    this.darkerBackgroundColor = this.adjustColorBrightness(backgroundColor, -20);
    this.progressColor = this.adjustColorBrightness(backgroundColor, 40);

    const interval = setInterval(() => {
      this.progress -= 5;
      if (this.progress <= 0) {
        clearInterval(interval);
      }
    }, 100);

    this.subscriptions.add(
      this.popUpService.duration$.subscribe((duration) => {
        setTimeout(() => {
          this.isVisible = false;
          this.popUpService.clearMessage();
          this.progress = 0;
        }, duration);
      })
    );
  }

  private adjustColorBrightness(color: string, percent: number): string {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const r = Math.min(255, Math.max(0, (num >> 16) + amt));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  private getTruncatedMessageWithGradient(text: string, charLimit: number, gradientCount: number): string {
    if (text.length <= charLimit) return text;

    const truncated = text.slice(0, charLimit) + '...';
    const visiblePart = truncated.slice(0, -gradientCount);
    const gradientPart = truncated.slice(-gradientCount).split('').map((char, index) => {
      const opacity = 1 - (index / gradientCount) * 0.8;
      return `<span style="opacity: ${opacity};">${char}</span>`;
    }).join('');
    return visiblePart + gradientPart;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
