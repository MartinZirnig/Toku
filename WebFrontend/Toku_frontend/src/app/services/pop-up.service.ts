import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PopUpService {
  private messageSubject = new BehaviorSubject<string | null>(null);
  private durationSubject = new BehaviorSubject<number>(2000); // Default duration: 2 seconds
  private backgroundColorSubject = new BehaviorSubject<string>('#3b82f6'); // Default background color
  private textColorSubject = new BehaviorSubject<string>('#ffffff'); // Default text color

  message$ = this.messageSubject.asObservable();
  duration$ = this.durationSubject.asObservable();
  backgroundColor$ = this.backgroundColorSubject.asObservable();
  textColor$ = this.textColorSubject.asObservable();

  showMessage(message: string, duration: number = 2000, backgroundColor: string = '#3b82f6', textColor: string = '#ffffff'): void {
    this.messageSubject.next(message);
    this.durationSubject.next(duration);
    this.backgroundColorSubject.next(backgroundColor);
    this.textColorSubject.next(textColor);
  }

  clearMessage(): void {
    this.messageSubject.next(null);
  }
}
