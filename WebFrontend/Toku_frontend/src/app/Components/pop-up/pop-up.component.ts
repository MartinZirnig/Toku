import { NgIf } from '@angular/common';
import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-pop-up',
  standalone: true, // Mark as standalone
  imports: [NgIf],
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.scss'
})
export class PopUpComponent implements OnInit, OnDestroy, OnChanges {
  @Input() message: string = '';
  @Input() backgroundColor: string = '#3b82f6';
  @Input() textColor: string = '#ffffff';
  @Input() duration: number = 2000; // Duration in milliseconds
  progress: number = 100;
  truncatedMessage: SafeHtml = ''; // Use SafeHtml for sanitized content
  darkerBackgroundColor: string = '#1e40af';
  progressColor: string = '#93c5fd';
  dynamicWidth: string = 'auto'; // Dynamically calculated width
  private intervalId: any;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.updatePopUp();
    this.darkerBackgroundColor = this.adjustColorBrightness(this.backgroundColor, -20);
    this.progressColor = this.adjustColorBrightness(this.backgroundColor, 40);

    // Start the progress bar timer
    const decrementAmount = 100 / (this.duration / 100); // Calculate decrement per 100ms
    this.intervalId = setInterval(() => {
      this.progress -= decrementAmount;
      if (this.progress <= 0) {
        this.progress = 0;
        clearInterval(this.intervalId);
      }
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message']) {
      this.updatePopUp();
    }
  }

  private updatePopUp(): void {
    if (this.message.length > 30) {
      this.truncatedMessage = this.sanitizer.bypassSecurityTrustHtml(
        this.getTruncatedMessageWithGradient(this.message, 30, 5)
      );
    } else {
      this.truncatedMessage = this.sanitizer.bypassSecurityTrustHtml(this.message);
    }

    // Recalculate width after the DOM is updated
    setTimeout(() => {
      this.adjustDynamicWidth();
    }, 0);
  }

  private adjustDynamicWidth(): void {
    const container = document.querySelector('.pop-up-container') as HTMLElement;
    const span = container?.querySelector('span') as HTMLElement;

    if (span && container) {
      // Temporarily reset the width to auto to allow recalculation
      this.dynamicWidth = 'auto';

      // Use the span's scrollWidth to get the full width of the rendered content
      const contentWidth = span.scrollWidth;

      // Set the dynamic width based on the content width and add consistent padding
      this.dynamicWidth = `calc(${contentWidth}px + 2rem)`;

      // Apply the recalculated width to the container
      container.style.width = this.dynamicWidth;
    }
  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
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
}
