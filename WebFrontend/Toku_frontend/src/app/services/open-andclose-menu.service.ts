import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenAndcloseMenuService {

  // RxJS
  private _visible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  //public visible$: Observable<boolean> = this._visible.asObservable();
  //public dropdown$: Observable<boolean> = this._visible.asObservable().pipe(
   // delay(400)
  //);




  showDropdown: boolean = false;
  isVisible: boolean = false;

  public constructor() { }

  public toggleDropdownMenu() {
    this._visible.next(!this._visible.value);
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.showDropdown = !this.showDropdown;
    }
    else {
      setTimeout( () => this.showDropdown = !this.showDropdown, 400);
    }
    
}
}
