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

    // Reset all subjects to ensure the latest values are broadcasted
    this.messageSubject.next(null); // Clear the previous message
    this.durationSubject.next(duration);
    this.backgroundColorSubject.next(backgroundColor);
    this.textColorSubject.next(textColor);

    // Broadcast the new message after resetting
    setTimeout(() => {
      this.messageSubject.next(message);
    }, 0);
  }

  clearMessage(): void {
    this.messageSubject.next(null);
  }

  getDuration(): number {
    return this.durationSubject.getValue();
  }

  getBackgroundColor(): string {
    return this.backgroundColorSubject.getValue();
  }

  getTextColor(): string {
    return this.textColorSubject.getValue();
  }
}
