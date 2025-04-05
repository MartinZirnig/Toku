import { Component } from '@angular/core';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { UserSettingsComponent } from './Components/user-settings/user-settings.component';

@Component({
  selector: 'app-root',
  imports: [MainPageComponent, UserSettingsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
  
})

export class AppComponent {
  title = 'Toku_frontend';
  
  }
