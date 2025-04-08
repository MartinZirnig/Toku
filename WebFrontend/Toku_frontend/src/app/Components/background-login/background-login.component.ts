import { Component } from '@angular/core';

@Component({
  selector: 'app-background-login',
  imports: [],
  templateUrl: './background-login.component.html',
  styleUrl: './background-login.component.scss'
})
export class BackgroundLoginComponent {
  isSmallScreen: boolean = window.innerWidth < 700;

  constructor() {
    window.addEventListener('resize', () => {
      this.isSmallScreen = window.innerWidth < 700;
    });
  }
}
