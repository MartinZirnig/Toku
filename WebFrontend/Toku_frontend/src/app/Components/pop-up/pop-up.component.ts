import { NgIf } from '@angular/common';
import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges, AfterViewInit, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ColorManagerService } from '../../services/color-manager.service';
import { ColorSettingsModel } from '../../data_managements/models/color-settings-model';

@Component({
  selector: 'app-pop-up',
  standalone: true, 
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.scss'
})
export class PopUpComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() id!: number;
  @Input() message: string = '';
  @Input() duration: number = 2000;
  @Input() backgroundColor?: string;
  @Input() textColor?: string;
  progress: number = 100;
  truncatedMessage: SafeHtml = '';
  isVisible: boolean = false;
  private intervalId: any;

  public csm: ColorSettingsModel;

  constructor(
    private sanitizer: DomSanitizer,
    private colorManager: ColorManagerService,
    private el: ElementRef
  ) {
    this.csm = this.colorManager.csm;
  }

  ngOnInit(): void {
    this.updatePopUp();
    setTimeout(() => {
      this.isVisible = true;
    }, 0);

    const decrementAmount = 95 / (this.duration / 100);
    this.intervalId = setInterval(() => {
      this.progress -= decrementAmount;
      if (this.progress <= 0) {
        this.progress = 0;
        clearInterval(this.intervalId);
        this.isVisible = false;
      }
    }, 100);
  }

  ngAfterViewInit(): void {
    if (!this.csm) return;
    const root = this.el.nativeElement ?? document.documentElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    setVar('--popup-bg', this.csm.popupBackground.toRgbaString());
    setVar('--popup-text', this.csm.primaryText.toRgbaString());
    setVar('--popup-progress-bg', this.csm.popupBorder.toRgbaString());
    setVar('--popup-progress', this.csm.popupProgress.toRgbaString());
    setVar('--popup-shadow', this.csm.popupShadow.toRgbaString());
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
  }

  ngOnDestroy(): void {
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
