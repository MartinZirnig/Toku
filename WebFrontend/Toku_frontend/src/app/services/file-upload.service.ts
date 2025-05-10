import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private filesSubject = new BehaviorSubject<File[]>([]);
  private isVisibleSubject = new BehaviorSubject<boolean>(false);

  files$ = this.filesSubject.asObservable();
  isVisible$ = this.isVisibleSubject.asObservable();

  setFiles(files: File[]): void {
    this.filesSubject.next(files);
  }

  toggleVisibility(): void {
    this.isVisibleSubject.next(!this.isVisibleSubject.value);
  }

  closeWithFilesCheck(): void {
    if (this.filesSubject.value.length > 0) {
      this.isVisibleSubject.next(false);
    }
  }
}
