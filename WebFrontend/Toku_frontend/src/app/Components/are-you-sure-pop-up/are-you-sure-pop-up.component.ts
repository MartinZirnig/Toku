import { Component } from '@angular/core';
import { AreYouSurePopUpService } from './are-you-sure-pop-up.service';
import { NgIf } from '@angular/common';
import { ColorManagerService } from '../../services/color-manager.service';
import { ColorSettingsModel } from '../../data_managements/models/color-settings-model';

@Component({
  selector: 'app-are-you-sure-pop-up',
  standalone: true,
  imports: [NgIf],
  templateUrl: './are-you-sure-pop-up.component.html',
  styleUrl: './are-you-sure-pop-up.component.scss'
})
export class AreYouSurePopUpComponent {
  public csm: ColorSettingsModel;

  get message() { return this.areYouSureService.message; }
  get yesText() { return this.areYouSureService.yesText || 'Yes'; }
  get noText() { return this.areYouSureService.noText || 'No'; }
  get updateText() { return this.areYouSureService.updateText; }
  get showUpdate() { return !!this.areYouSureService.updateText; }

  constructor(
    public areYouSureService: AreYouSurePopUpService,
    private colorManager: ColorManagerService
  ) {
    this.csm = colorManager.csm;
  }

  ngAfterViewInit() {
    setTimeout(() => this.applyColors(), 0);
  }

  private applyColors() {
    const overlay = document.querySelector('.popup-overlay') as HTMLElement;
    const box = document.querySelector('.popup-box') as HTMLElement;
    if (!box || !this.csm) return;

    if (overlay) {
      overlay.style.setProperty('--overlay-bg', this.csm.overlayBackground.toRgbaString());
    }
    box.style.setProperty('--popup-bg', this.csm.popupBackground.toRgbaString());
    box.style.setProperty('--popup-border', this.csm.popupBorder.toRgbaString());
    box.style.setProperty('--heading-text', this.csm.headingText.toRgbaString());
    box.style.setProperty('--secondary-text', this.csm.secondaryText.toRgbaString());
    box.style.setProperty('--button-text', this.csm.buttonText.toRgbaString());

    // Yes button (gradient)
    box.style.setProperty('--yes-btn-bg', this.csm.deleteGradientButton.toLinearGradientString(90));
    box.style.setProperty('--yes-btn-bg-hover', this.csm.deleteGradientButtonHover.toLinearGradientString(90));
    // No button (secondary)
    box.style.setProperty('--no-btn-bg', this.csm.secondaryButton.toRgbaString());
    box.style.setProperty('--no-btn-bg-hover', this.csm.secondaryButtonHover.toRgbaString());
    // Update button (confirm gradient)
    box.style.setProperty('--update-btn-bg', this.csm.confirmGradientButton.toLinearGradientString(90));
    box.style.setProperty('--update-btn-bg-hover', this.csm.confirmGradientButtonHover.toLinearGradientString(90));
  }

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
