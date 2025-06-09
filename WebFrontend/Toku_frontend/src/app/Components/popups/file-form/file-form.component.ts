import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FileUploadService } from '../../../services/file-upload.service';
import { ColorManagerService } from '../../../services/color-manager.service';
import { ColorSettingsModel } from '../../../data_managements/models/color-settings-model';

@Component({
  selector: 'app-file-form',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './file-form.component.html',
  styleUrl: './file-form.component.scss',
})
export class FileFormComponent implements AfterViewInit {
  files: File[] = [];
  isDragging = false; // Add this property to track drag state
  public csm: ColorSettingsModel;

  constructor(
    private fileUploadService: FileUploadService,
    private colorManager: ColorManagerService,
    private el: ElementRef
  ) {
    this.fileUploadService.files$.subscribe((files) => (this.files = files));
    this.csm = this.colorManager.csm;
  }

  ngAfterViewInit() {
    if (!this.csm) return;
    const root = this.el.nativeElement ?? document.documentElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    setVar('--ff-popup-overlay-bg', this.csm.overlayBackground.toRgbaString());
    setVar('--ff-popup-bg', this.csm.popupBackground.toRgbaString());
    setVar('--ff-popup-border', this.csm.listBorder.toRgbaString());
    setVar('--ff-popup-shadow', this.csm.popupShadow.toRgbaString());
    setVar('--ff-primary-text', this.csm.primaryText.toRgbaString());
    setVar('--ff-secondary-text', this.csm.secondaryText.toRgbaString());
    setVar('--ff-list-border', this.csm.listBorder.toRgbaString());
    setVar('--ff-scrollbar-thumb', this.csm.scrollbarThumb.toRgbaString());
    setVar('--ff-scrollbar-thumb-hover', this.csm.scrollbarThumbHover.toRgbaString());
    setVar('--ff-scrollbar-track', this.csm.scrollbarTrack.toRgbaString());
    setVar('--ff-btn-gradient', this.csm.confirmGradientButton.toLinearGradientString(135));
    setVar('--ff-btn-gradient-hover', this.csm.confirmGradientButtonHover.toLinearGradientString(135));
    setVar('--ff-btn-text', this.csm.buttonText.toRgbaString());
    setVar('--ff-remove-btn-bg', this.csm.deleteGradientButton.toLinearGradientString(135));
    setVar('--ff-remove-btn-hover-bg', this.csm.deleteGradientButtonHover.toLinearGradientString(135));
    setVar('--ff-list-bg', this.csm.cardBackground.toRgbaString());
    setVar('--ff-list-item-bg', this.csm.inputBackground.toRgbaString());
    setVar('--ff-list-item-hover-bg', this.csm.highlightBackground.toRgbaString());
    setVar('--ff-list-item-remove-bg', this.csm.deleteGradientButton.toLinearGradientString(135));
    setVar('--ff-list-item-remove-hover-bg', this.csm.deleteGradientButtonHover.toLinearGradientString(135));
  }

  onFileInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      const newFiles = Array.from(target.files);
      this.fileUploadService.setFiles([...this.files, ...newFiles]);
    }
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
    this.fileUploadService.setFiles(this.files);
  }

  confirmUpload(): void {
    this.fileUploadService.toggleVisibility(); // Always close the form
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true; // Set dragging state
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false; // Reset dragging state
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false; // Reset dragging state
    if (event.dataTransfer?.files.length) {
      const newFiles = Array.from(event.dataTransfer.files);
      this.fileUploadService.setFiles([...this.files, ...newFiles]);
    }
  }

  formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let unitIndex = -1;
    let formattedSize = size;
    do {
      formattedSize /= 1024;
      unitIndex++;
    } while (formattedSize >= 1024 && unitIndex < units.length - 1);
    return `${formattedSize.toFixed(2)} ${units[unitIndex]}`;
  }

  getTotalFileSize(): string {
    const totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
    return this.formatFileSize(totalSize);
  }
}
