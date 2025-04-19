import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ActiveGroupMenuService {
  declare public inEditMode: boolean;

  constructor() { 
    this.inEditMode = false;
  }
}
