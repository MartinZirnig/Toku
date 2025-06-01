import { NgFor } from '@angular/common';
import { Component, EventEmitter, NgModule, Output } from '@angular/core';
import { NgModel } from '@angular/forms';
import { ProfilePictureCircledComponent } from '../profile-picture-circled/profile-picture-circled.component';

@Component({
  selector: 'app-chat-login-popup-group-list',
  standalone: true,
  imports: [NgFor, ProfilePictureCircledComponent], // ensure only standalone components, directives, pipes, or NgModules are here
  templateUrl: './chat-login-popup-group-list.component.html',
  styleUrl: './chat-login-popup-group-list.component.scss'
})
export class ChatLoginPopupGroupListComponent {
  @Output() selectGroup = new EventEmitter<{ name: string, id: number }>();
  @Output() close = new EventEmitter<void>();

  groups = [
    {
      name: 'Public Group Alpha',
      id: 101,
      picture: 'https://randomuser.me/api/portraits/lego/1.jpg'
    },
    {
      name: 'Beta Chat',
      id: 202,
      picture: 'https://randomuser.me/api/portraits/lego/2.jpg'
    },
    {
      name: 'Gamma Room',
      id: 303,
      picture: 'https://randomuser.me/api/portraits/lego/3.jpg'
    },
    {
      name: 'Delta Squad',
      id: 404,
      picture: 'https://randomuser.me/api/portraits/lego/4.jpg'
    },
    {
      name: 'Omega Lounge',
      id: 505,
      picture: 'https://randomuser.me/api/portraits/lego/5.jpg'
    },
    {
      name: 'Sigma Friends',
      id: 606,
      picture: 'https://randomuser.me/api/portraits/lego/6.jpg'
    },
    {
      name: 'Lambda Crew',
      id: 707,
      picture: 'https://randomuser.me/api/portraits/lego/7.jpg'
    },
    {
      name: 'Zeta Zone',
      id: 808,
      picture: 'https://randomuser.me/api/portraits/lego/8.jpg'
    }
  ];

  select(group: any) {
    this.selectGroup.emit({ name: group.name, id: group.id });
  }
}
