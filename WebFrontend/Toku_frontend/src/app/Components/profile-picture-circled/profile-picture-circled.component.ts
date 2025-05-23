import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile-picture-circled',
  templateUrl: './profile-picture-circled.component.html',
  styleUrl: './profile-picture-circled.component.scss',
  imports: [NgIf],
})
export class ProfilePictureCircledComponent {
  @Input() picture?: string;
}
