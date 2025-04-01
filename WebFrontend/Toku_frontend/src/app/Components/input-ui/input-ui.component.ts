import { Component } from '@angular/core';
import {
  buttonBackground,
  buttonHoverBackground,
  textColor,
  placeholderColor,
  textareaBackground,
  textareaFocusBackground,
  iconColor,
  iconHoverColor,
} from '../../services/colors.service';

@Component({
  selector: 'app-input-ui',
  imports: [],
  templateUrl: './input-ui.component.html',
  styleUrl: './input-ui.component.scss'
})
export class InputUIComponent {

ngOnInit(){
setupChatUI();
}

}



// Funkce pro nastavení barev a událostí
function setupChatUI() {
  const pinButton = document.getElementById("pin-button");
  const sendButton = document.getElementById("send-button");
  const textarea = document.getElementById("chat-textarea");

  if (!pinButton || !sendButton || !textarea) {
      console.error("Některé prvky UI nebyly nalezeny!");
      return;
  }

  // Nastavení barev pro tlačítka
  pinButton.style.backgroundColor = buttonBackground;
  pinButton.style.color = iconColor;
  sendButton.style.backgroundColor = buttonBackground;
  sendButton.style.color = iconColor;

  // Nastavení barev pro textarea
  textarea.style.backgroundColor = textareaBackground;
  textarea.style.color = textColor;
  textarea.style.setProperty("--placeholder-color", placeholderColor); // Placeholder barva

  // Hover efekty pro tlačítka
  pinButton.addEventListener("mouseenter", () => {
      pinButton.style.backgroundColor = buttonHoverBackground;
      pinButton.style.color = iconHoverColor;
  });
  pinButton.addEventListener("mouseleave", () => {
      pinButton.style.backgroundColor = buttonBackground;
      pinButton.style.color = iconColor;
  });

  sendButton.addEventListener("mouseenter", () => {
      sendButton.style.backgroundColor = buttonHoverBackground;
      sendButton.style.color = iconHoverColor;
  });
  sendButton.addEventListener("mouseleave", () => {
      sendButton.style.backgroundColor = buttonBackground;
      sendButton.style.color = iconColor;
  });

  // Focus efekt pro textarea
  textarea.addEventListener("focus", () => {
      textarea.style.backgroundColor = textareaFocusBackground;
  });
  textarea.addEventListener("blur", () => {
      textarea.style.backgroundColor = textareaBackground;
  });
}
/*
// Spustíme funkci po načtení stránky
document.addEventListener("DOMContentLoaded", setupChatUI);
*/
