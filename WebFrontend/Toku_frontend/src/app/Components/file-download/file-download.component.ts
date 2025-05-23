import { NgFor } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-file-download',
  templateUrl: './file-download.component.html',
  styleUrls: ['./file-download.component.scss'],
  standalone: true,
  imports: [NgFor]
})
export class FileDownloadComponent {
  @Input() files: { name: string, size: number, url: string }[] = [];
  @Output() close = new EventEmitter<void>();

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
