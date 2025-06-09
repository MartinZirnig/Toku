import { NgFor } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { ColorManagerService } from '../../../services/color-manager.service';
import { ColorSettingsModel } from '../../../data_managements/models/color-settings-model';

@Component({
  selector: 'app-file-download',
  templateUrl: './file-download.component.html',
  styleUrls: ['./file-download.component.scss'],
  standalone: true,
  imports: [NgFor]
})
export class FileDownloadComponent implements OnInit, AfterViewInit {
  @Input() files: { name: string, size: number, url: string }[] = [];
  @Output() close = new EventEmitter<void>();

  public csm: ColorSettingsModel;

  constructor(
    private colorManager: ColorManagerService,
    private el: ElementRef
  ) {
    this.csm = this.colorManager.csm;
  }

  ngOnInit() {
    // případně další logika
  }

  ngAfterViewInit() {
    if (!this.csm) return;
    const root = this.el.nativeElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    setVar('--popup-overlay-bg', this.csm.overlayBackground.toRgbaString());
    setVar('--popup-bg', this.csm.popupBackground.toRgbaString());
    setVar('--popup-shadow', this.csm.popupShadow.toRgbaString());
    setVar('--popup-border', this.csm.popupBorder.toRgbaString());
    setVar('--primary-text', this.csm.primaryText.toRgbaString());
    setVar('--secondary-text', this.csm.secondaryText.toRgbaString());
    setVar('--list-border', this.csm.listBorder.toRgbaString());
    setVar('--list-bg', this.csm.listBackground.toRgbaString());
    setVar('--list-item-bg', this.csm.cardBackground.toRgbaString());
    setVar('--list-item-hover-bg', this.csm.listItemHover.toRgbaString());
    setVar('--download-btn-bg', this.csm.gradientButton?.toLinearGradientString(135) ?? '');
    setVar('--download-btn-hover-bg', this.csm.gradientButtonHover?.toLinearGradientString(135) ?? '');
    setVar('--download-btn-text', this.csm.buttonText.toRgbaString());
    setVar('--close-btn-bg', this.csm.closeButtonBackground.toRgbaString());
    setVar('--close-btn-hover-bg', this.csm.closeButtonBackgroundHover.toRgbaString());
    setVar('--close-btn-icon', this.csm.closeButtonIcon.toRgbaString());
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  downloadFile(file: { name: string, url: string }) {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  }

  onClose() {
    this.close.emit();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    event.preventDefault();
    this.onClose();
  }
}
