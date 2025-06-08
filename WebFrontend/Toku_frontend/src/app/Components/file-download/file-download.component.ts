import { NgFor } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { ColorManagerService } from '../../services/color-manager.service';
import { ColorSettingsModel } from '../../data_managements/models/color-settings-model';
import { StoredDownloadableFileModel } from '../../data_managements/models/stored-downloadable-file-model';
import { UserService } from '../../data_managements/services/user.service';
import { MessageService } from '../../data_managements/services/message.service';
import { FileService } from '../../data_managements/services/file.service';

@Component({
  selector: 'app-file-download',
  templateUrl: './file-download.component.html',
  styleUrls: ['./file-download.component.scss'],
  standalone: true,
  imports: [NgFor]
})
export class FileDownloadComponent implements OnInit, AfterViewInit {
  @Input() MessageId?: number;
  
  files: StoredDownloadableFileModel[] = [];
  @Output() close = new EventEmitter<void>();

  public csm: ColorSettingsModel;

  constructor(
    private colorManager: ColorManagerService,
    private el: ElementRef,
    private messageService: MessageService,
    private fileService: FileService
  ) {
    this.csm = this.colorManager.csm;
  }

  ngOnInit() {
    if (!this.MessageId) return;

    this.messageService.getDownloadableFiles(this.MessageId).subscribe({
      next: response => {
        if (response){
          this.files = response; 
        } else {
          console.log("cannot fetch message files: No response");
        }

      },
      error: err => {
        console.error("cannot fetch message files: ", err);
      }
    })
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

  downloadFile(file: StoredDownloadableFileModel) {
    this.fileService.getGroupSecret(String(file.id)).subscribe({
      next: response => {
        if (response){
            const url = URL.createObjectURL((response.body as Blob));
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            
            a.click();

            URL.revokeObjectURL(url);
        } else {
          console.error("cannot download file: No response");
        }
      },
      error: err => {
        console.error("cannot download file: ", err);
      }
    });
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
