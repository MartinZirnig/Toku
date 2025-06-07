import { NgIf } from '@angular/common';
import { Component, Input, OnInit, AfterViewInit, ElementRef, inject } from '@angular/core';
import { ColorManagerService } from '../../services/color-manager.service';
import { ColorSettingsModel } from '../../data_managements/models/color-settings-model';

@Component({
  selector: 'app-profile-picture-circled',
  templateUrl: './profile-picture-circled.component.html',
  styleUrl: './profile-picture-circled.component.scss',
  imports: [NgIf],
})
export class ProfilePictureCircledComponent implements AfterViewInit {
  @Input() picture?: string;

  public csm: ColorSettingsModel;

  private el = inject(ElementRef);

  constructor(private colorManager: ColorManagerService) {
    this.csm = this.colorManager.csm;
  }

  ngAfterViewInit() {
    if (!this.csm) return;
    const root: HTMLElement = this.el.nativeElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    setVar('--profile-picture-bg', this.csm.profilePictureBackground.toRgbaString());
    setVar('--avatar-gradient-bg', this.csm.avatarGradientBackground.toLinearGradientString(135));
    setVar('--avatar-icon-color', this.csm.avatarIconColor.toRgbaString());
  }
}
