import { Component } from '@angular/core';
import { AreYouSurePopUpService } from './are-you-sure-pop-up.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-are-you-sure-pop-up',
  standalone: true,
  imports: [NgIf],
  templateUrl: './are-you-sure-pop-up.component.html',
  styleUrl: './are-you-sure-pop-up.component.scss'
})
export class AreYouSurePopUpComponent {
  get message() { return this.areYouSureService.message; }
  get yesText() { return this.areYouSureService.yesText || 'Yes'; }
  get noText() { return this.areYouSureService.noText || 'No'; }
  get updateText() { return this.areYouSureService.updateText; }
  get showUpdate() { return !!this.areYouSureService.updateText; }

  constructor(public areYouSureService: AreYouSurePopUpService) {}

  onYes() {
    this.areYouSureService.confirm('yes');
  }
  onNo() {
    this.areYouSureService.confirm('no');
  }
  onUpdate() {
    this.areYouSureService.confirm('update');
  }
}
