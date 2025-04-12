import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule for NgIf, NgClass, etc.
import { AppComponent } from './app.component';
import { Message_senderComponent } from './Components/message_sender/message_sender.component';

@NgModule({
  declarations: [
    AppComponent,
    Message_senderComponent, // Ensure this component is declared here
  ],
  imports: [
    BrowserModule,
    FormsModule, // Add FormsModule here
    CommonModule, // Add CommonModule here for NgIf, NgClass, etc.
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}