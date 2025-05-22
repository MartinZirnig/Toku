import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PopUpService } from './services/pop-up.service';
import { PopUpComponent } from './Components/pop-up/pop-up.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PopUpComponent, NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
  
})

export class AppComponent {
  title = 'Toku';
  public popUps: Array<{ message: string; backgroundColor: string; textColor: string; id: number; duration: number }> = [];
  private popUpIdCounter: number = 0;
  constructor(private popUpService: PopUpService) {}

  
  ngOnInit() {
   

       this.popUpService.message$.subscribe((message) => {
      if (message) {
        const duration = this.popUpService.getDuration();
        const backgroundColor = this.popUpService.getBackgroundColor();
        const textColor = this.popUpService.getTextColor();
        console.log('MainPageComponent: Received pop-up data:', { message, duration, backgroundColor, textColor });
        this.addPopUp(message, duration, backgroundColor, textColor);
      }
    });
  }

private addPopUp(message: string, duration: number, backgroundColor: string, textColor: string): void {
    const id = this.popUpIdCounter++;
    console.log('Adding pop-up:', { message, backgroundColor, textColor, id, duration });
    this.popUps.push({ message, backgroundColor, textColor, id, duration });

    // Reset the counter if it exceeds a safe threshold
    if (this.popUpIdCounter > 1000000) {
      console.log('Resetting popUpIdCounter to prevent overflow');
      this.popUpIdCounter = 0;
    }

    // Trigger the "out" animation just before the pop-up is removed
    setTimeout(() => {
      console.log('Triggering "out" animation for pop-up with ID:', id);
      const popUp = this.popUps.find((popUp) => popUp.id === id);
      if (popUp) {
        const element = document.querySelector(`.pop-up-container[data-id="${id}"]`) as HTMLElement;
        if (element) {
          element.classList.remove('visible');
          element.classList.add('hidden');
        }
      }
    }, duration - 300); // Start the "out" animation 300ms before removal

    // Remove the pop-up after the animation completes
    setTimeout(() => {
      console.log('Removing pop-up with ID:', id);
      this.removePopUp(id);
    }, duration);
  }

  private removePopUp(id: number): void {
    console.log('Before removal, popUps:', this.popUps);

    // Add a delay to allow the "out" animation to complete
    setTimeout(() => {
      this.popUps = this.popUps.filter((popUp) => popUp.id !== id);
      console.log('After removal, popUps:', this.popUps);
    }, 300); // Match the animation duration (300ms)
  }

}
