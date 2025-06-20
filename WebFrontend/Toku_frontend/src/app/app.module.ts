import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule for NgIf, NgClass, etc.
import { AppComponent } from './app.component';
import { Message_senderComponent } from './Components/messages/message_sender/message_sender.component';

@NgModule({
  declarations: [
 // Ensure this component is declared here
  ],
  imports: [
    BrowserModule,
    FormsModule, // Add FormsModule here
    CommonModule, // Add CommonModule here for NgIf, NgClass, etc.
  ],
  providers: [],
  bootstrap: [],
})
export class AppModule {}
