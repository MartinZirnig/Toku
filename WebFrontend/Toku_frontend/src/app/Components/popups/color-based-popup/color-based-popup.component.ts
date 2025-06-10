import { Component } from '@angular/core';
import { ColorManagerService } from '../../../services/color-manager.service';
import { ColorSettingsModel } from '../../../data_managements/models/color-settings-model';
import { NgStyle } from '@angular/common';
import { ArgbColorModel } from '../../../data_managements/models/argb-color-model';
import { GradientArgbColorModel } from '../../../data_managements/models/gradient-argb-color-model';

@Component({
  selector: 'app-color-based-popup',
  standalone: true,
  templateUrl: './color-based-popup.component.html',
  styleUrl: './color-based-popup.component.scss',
  imports: [NgStyle]
})
export class ColorBasedPopupComponent {
  public csm: ColorSettingsModel;
  public colorVars: { name: string, value: string, type: 'color' | 'gradient' }[] = [];

  // Přidej pole klíčů pro barvy a gradienty
  public argbColorKeys: string[] = [
    'buttonDisabled', 'secondaryButton', 'secondaryButtonHover', 'closeButtonBackground', 'closeButtonBackgroundHover', 'closeButtonIcon',
    'overlayBackground', 'popupBackground', 'sidebarBackground', 'inputBackground', 'inputBackgroundFocus', 'cardBackground', 'highlightBackground',
    'menuBackground', 'menuDropdownBackground', 'menuDropdownItemHoverBackground', 'inputBarBackground', 'inputBarShadow', 'messageSenderBackground',
    'messageAdresatorBackground', 'messagePreviewBackground', 'messageFilePreviewBackground', 'messageAvatarBackground', 'reactionCounterBackground',
    'reactionPopupBackground', 'reactionPopupItemBackground', 'reactionPopupItemHoverBackground', 'popupBorder', 'inputBorder', 'inputBorderFocus',
    'errorBorder', 'listBorder', 'replyPreviewBarBorder', 'listDivider', 'primaryText', 'secondaryText', 'mutedText', 'disabledText', 'dangerText',
    'successText', 'buttonText', 'headingText', 'messageSenderText', 'messageAdresatorText', 'messagePreviewText', 'messageFilePreviewText',
    'messageFilePreviewIcon', 'reactionCounterText', 'reactionPopupItemText', 'popupText', 'inputText', 'inputPlaceholder', 'fileCountCircleText',
    'menuActionText', 'menuActionDisabledText', 'menuDeleteText', 'avatarIconColor', 'errorBackground', 'successBackground', 'warningBackground',
    'switchThumb', 'switchThumbShadow', 'scrollbarThumb', 'scrollbarThumbHover', 'scrollbarTrack', 'inputScrollbarTrack', 'shadow', 'popupShadow',
    'menuShadow', 'menuDropdownShadow', 'buttonShadow', 'listShadow', 'messageShadow', 'profilePictureBackground', 'fileCountCircleBackground',
    'replyPreviewBarCloseButton', 'replyPreviewBarCloseButtonHover', 'messagePlaceholder', 'messageStatusIcon', 'messageStatusReadIcon',
    'inputSpinnerDot', 'inputSpinnerText', 'popupProgressTrack', 'popupProgress', 'reactionPopupShadow', 'menuButtonBackground',
    'menuButtonBackgroundHover', 'menuButtonIconHover', 'menuActionBackground', 'menuActionBackgroundHover', 'menuActionIcon', 'menuActionIconHover',
    'menuActionDisabledBackground', 'menuActionDisabledIcon', 'menuDeleteBackground', 'menuDeleteBackgroundHover', 'menuDeleteIcon',
    'menuDeleteIconHover', 'listBackground', 'listItemHover', 'listItemActive', 'listItemRing'
  ];

  public gradientColorKeys: string[] = [
    'confirmGradientButton', 'confirmGradientButtonHover', 'confirmGradientButtonDisabled', 'deleteGradientButton', 'deleteGradientButtonHover',
    'deleteGradientButtonDisabled', 'gradientButton', 'gradientButtonHover', 'gradientButtonDisabled', 'buttonActive', 'mainBackground',
    'menuBarBackground', 'groupPictureBackground', 'avatarGradientBackground', 'popupGradientBorder', 'mainBorder', 'inputScrollbarThumb',
    'inputScrollbarThumbHover', 'menuGradientBorder', 'menuButtonGradientHover'
  ];

  constructor(private colorManager: ColorManagerService) {
    this.csm = this.colorManager.csm;

    // Inicializace chybějících barev
    this.argbColorKeys.forEach((key) => {
      if (!(this.csm as any)[key]) {
        (this.csm as any)[key] = new ArgbColorModel(0, 0, 0, 255);
      }
    });
    this.gradientColorKeys.forEach((key) => {
      if (!(this.csm as any)[key]) {
        (this.csm as any)[key] = new GradientArgbColorModel(
          255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0
        );
      }
    });

    // Naplň colorVars pro zobrazení v šabloně
    this.colorVars = [
      ...this.argbColorKeys.map(key => ({
        name: key,
        value: (this.csm as any)[key]?.toRgbaString?.() ?? '',
        type: 'color' as const
      })),
      ...this.gradientColorKeys.map(key => ({
        name: key,
        value: (this.csm as any)[key]?.toLinearGradientString?.(135) ?? '',
        type: 'gradient' as const
      }))
    ];
  }
}
