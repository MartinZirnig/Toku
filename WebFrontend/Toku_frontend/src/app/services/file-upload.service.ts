import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { RequestResultModel } from '../data_managements/models/result-model';
import { FileService } from '../data_managements/services/file.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor(
    private service: FileService
  ) { }

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

  private buildFile(file: File): FormData{
    const formData = new FormData();

    formData.append('file', file)

    return formData;
  }

  sendUser(): Observable<RequestResultModel[]> {
    const observables: Observable<RequestResultModel>[] = [];
    
    this.filesSubject.value.forEach(f => {
      var file = this.buildFile(f);
      var operation = this.service.saveUserFile(file, uuidv4());
      observables.push(operation);
    });
    
    return forkJoin(observables);
  }
  
  sendSecretUser(): Observable<RequestResultModel[]> {
    const observables: Observable<RequestResultModel>[] = [];
    
    this.filesSubject.value.forEach(f => {
      var file = this.buildFile(f);
      var operation = this.service.saveSecretUserFile(file, uuidv4());
      observables.push(operation);
    });
    
    return forkJoin(observables);
  }

  sendGroup(): Observable<RequestResultModel[]> {
    const observables: Observable<RequestResultModel>[] = [];
    
    this.filesSubject.value.forEach(f => {
      var file = this.buildFile(f);
      var operation = this.service.saveGroupFile(file, uuidv4());
      observables.push(operation);
    });
    
    return forkJoin(observables);
  }
  
  sendSecretGroup(): Observable<RequestResultModel[]> {
    const observables: Observable<RequestResultModel>[] = [];
    
    this.filesSubject.value.forEach(f => {
      var file = this.buildFile(f);
      var operation = this.service.saveSecretGroupFile(file, uuidv4());
      observables.push(operation);
    });
    
    return forkJoin(observables);
  }
}