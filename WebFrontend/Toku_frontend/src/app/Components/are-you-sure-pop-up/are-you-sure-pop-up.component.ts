import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
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
  @Output() close = new EventEmitter<void>();
  public csm: ColorSettingsModel;

  get message() { return this.areYouSureService.message; }
  get yesText() { return this.areYouSureService.yesText || 'Yes'; }
  get noText() { return this.areYouSureService.noText || 'No'; }
  get updateText() { return this.areYouSureService.updateText; }
  get showUpdate() { return !!this.areYouSureService.updateText; }

  constructor(
    public areYouSureService: AreYouSurePopUpService,
    private colorManager: ColorManagerService,
    private el: ElementRef
  ) {
    this.csm = colorManager.csm;
  }

  ngAfterViewInit() {
    if (!this.csm || !this.csm.overlayBackground) return;

    const root = this.el.nativeElement ?? document.querySelector('app-are-you-sure-pop-up') ?? document.documentElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    const csm = this.csm;

    setVar('--overlay-bg', csm.overlayBackground.toRgbaString());
    setVar('--popup-bg', csm.popupBackground.toRgbaString());
    setVar('--popup-border', csm.popupBorder.toRgbaString());
    setVar('--heading-text', csm.headingText.toRgbaString());
    setVar('--secondary-text', csm.secondaryText.toRgbaString());
    setVar('--button-text', csm.buttonText.toRgbaString());
    setVar('--yes-btn-bg', csm.deleteGradientButton.toLinearGradientString(90));
    setVar('--yes-btn-bg-hover', csm.deleteGradientButtonHover.toLinearGradientString(90));
    setVar('--no-btn-bg', csm.secondaryButton.toRgbaString());
    setVar('--no-btn-bg-hover', csm.secondaryButtonHover.toRgbaString());
    setVar('--update-btn-bg', csm.confirmGradientButton.toLinearGradientString(90));
    setVar('--update-btn-bg-hover', csm.confirmGradientButtonHover.toLinearGradientString(90));
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
