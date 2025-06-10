import { NgIf } from '@angular/common';
import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { ColorManagerService } from '../../../services/color-manager.service';
import { ColorSettingsModel } from '../../../data_managements/models/color-settings-model';

@Component({
  selector: 'app-dummy-message-sender',
  imports: [NgIf],
  templateUrl: './dummy-message-sender.component.html',
  styleUrl: './dummy-message-sender.component.scss'
})
export class DummyMessageSenderComponent implements AfterViewInit {
  randomLines: number;
  animationDelays: string[] = [];
  public csm: ColorSettingsModel;

  constructor(
    private colorManager: ColorManagerService,
    private el: ElementRef
  ) {
    this.csm = this.colorManager.csm;
    this.randomLines = Math.floor(Math.random() * 3) + 1; // Generate random number between 1 and 3 once
    this.animationDelays = Array.from({ length: 9 }, () => `0.${Math.floor(Math.random() * 10)}s`); // Generate delays for up to 9 elements
  }

  ngAfterViewInit() {
    if (!this.csm) return;
    const root = this.el.nativeElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    setVar('--sender-bg', this.csm.messageSenderBackground.toRgbaString());
    setVar('--sender-placeholder', this.csm.messagePlaceholder.toRgbaString());
    setVar('--sender-icon', this.csm.messageStatusIcon.toRgbaString());
    setVar('--sender-icon-read', this.csm.messageStatusReadIcon.toRgbaString());
    setVar('--sender-text', this.csm.messageSenderText.toRgbaString());
  }
}
