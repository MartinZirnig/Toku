import { Component } from '@angular/core';
import { CommonModule, NgIf, NgStyle } from '@angular/common';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-file-form',
  standalone: true,
  imports: [CommonModule, NgStyle, NgIf],
  templateUrl: './file-form.component.html',
  styleUrl: './file-form.component.scss',
})
export class FileFormComponent {
  files: File[] = [];
  isDragging = false; // Add this property to track drag state

  constructor(private fileUploadService: FileUploadService) {
    this.fileUploadService.files$.subscribe((files) => (this.files = files));
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
