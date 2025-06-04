import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Server } from '../../data_managements/server';

@Component({
  selector: 'app-profile-picture-circled',
  templateUrl: './profile-picture-circled.component.html',
  styleUrl: './profile-picture-circled.component.scss',
  imports: [NgIf],
})
export class ProfilePictureCircledComponent {
  @Input() picture?: string;
}
