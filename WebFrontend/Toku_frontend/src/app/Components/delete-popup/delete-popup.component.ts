import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { DeletePopupService } from '../delete-popup/delete-popup.service';

@Component({
  selector: 'app-delete-popup',
  standalone: true,
  imports: [NgIf],
  templateUrl: './delete-popup.component.html',
  styleUrl: './delete-popup.component.scss'
})
export class DeletePopupComponent {
  constructor(public deletePopupService: DeletePopupService) {}

  close() {
    this.deletePopupService.close();
  }

  deleteForMe() {
    this.deletePopupService.hide();
  }

  deleteForAll() {
    this.deletePopupService.remove();
  }
}
