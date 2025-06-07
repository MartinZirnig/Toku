import { Component, Input, ElementRef, AfterViewInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { DeletePopupService } from '../delete-popup/delete-popup.service';
import { ColorManagerService } from '../../services/color-manager.service';
import { ColorSettingsModel } from '../../data_managements/models/color-settings-model';

@Component({
  selector: 'app-delete-popup',
  standalone: true,
  imports: [NgIf],
  templateUrl: './delete-popup.component.html',
  styleUrl: './delete-popup.component.scss'
})
export class DeletePopupComponent implements AfterViewInit {
  public csm: ColorSettingsModel;

  constructor(
    public deletePopupService: DeletePopupService,
    private colorManager: ColorManagerService,
    private el: ElementRef
  ) {
    this.csm = this.colorManager.csm;
  }

  ngAfterViewInit() {
    if (!this.csm) return;
    const root = this.el.nativeElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    setVar('--popup-overlay-bg', this.csm.overlayBackground.toRgbaString());
    setVar('--popup-bg', this.csm.popupBackground.toRgbaString());
    setVar('--popup-border', this.csm.popupBorder.toRgbaString());
    setVar('--popup-shadow', this.csm.popupShadow.toRgbaString());
    setVar('--popup-primary-text', this.csm.primaryText.toRgbaString());
    setVar('--popup-secondary-text', this.csm.secondaryText.toRgbaString());
    setVar('--popup-close-btn-bg', this.csm.secondaryButton.toRgbaString());
    setVar('--popup-close-btn-bg-hover', this.csm.secondaryButtonHover.toRgbaString());
    setVar('--popup-close-btn-icon', this.csm.closeButtonIcon.toRgbaString());
    setVar('--popup-gradient-btn-bg', this.csm.confirmGradientButton.toLinearGradientString(90));
    setVar('--popup-gradient-btn-bg-hover', this.csm.confirmGradientButtonHover.toLinearGradientString(90));
    setVar('--popup-gradient-btn-disabled', this.csm.confirmGradientButtonDisabled.toLinearGradientString(90));
    setVar('--popup-delete-gradient-btn-bg', this.csm.deleteGradientButton.toLinearGradientString(90));
    setVar('--popup-delete-gradient-btn-bg-hover', this.csm.deleteGradientButtonHover.toLinearGradientString(90));
    setVar('--popup-delete-gradient-btn-disabled', this.csm.deleteGradientButtonDisabled.toLinearGradientString(90));
  }

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
