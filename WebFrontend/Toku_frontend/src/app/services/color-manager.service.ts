import { Injectable } from '@angular/core';
import { ColorSettingsModel } from '../data_managements/models/color-settings-model';
import { ArgbColorModel } from '../data_managements/models/argb-color-model';
import { GradientArgbColorModel } from '../data_managements/models/gradient-argb-color-model';


@Injectable({
  providedIn: 'root'
})
export class ColorManagerService {
  public csm: ColorSettingsModel;

  constructor() { 
    // Oprava: vždy nastav csm na platný model
    this.csm = this.GetDefault();
    // Pokud někdy načítáte csm asynchronně, vždy nastavte synchronně fallback
  }
    private GetDefault() : ColorSettingsModel
    {
    return new ColorSettingsModel(
      // BUTTONS – hlavní gradientní tlačítka (potvrzení, přidání, odeslání)
      new GradientArgbColorModel(
        255, 70,243,255,    // #46f3ff 100%
        255, 82,138,169,   // #528aa9 80%
        255, 87,96,134,    // #576086 60%
        255, 123,100,154,  // #7b649a 40%
        255, 153,103,171,  // #9967ab 20%
        255, 255,115,227,  // #ff73e3 0%
      ), // confirmGradientButton

      new GradientArgbColorModel(
        255, 255,115,227,  // #ff73e3 0%
        255, 153,103,171,  // #9967ab 20%
        255, 123,100,154,  // #7b649a 40%
        255, 87,96,134,    // #576086 60%
        255, 82,138,169,   // #528aa9 80%
        255, 70,243,255    // #46f3ff 100%
      ), // confirmGradientButtonHover

      new GradientArgbColorModel(
        128, 70,243,255,   // 50% opacity, stejný gradient
        128, 82,138,169,
        128, 87,96,134,
        128, 87,96,134,
        128, 123,100,154,
        128, 153,103,171
      ), // confirmGradientButtonDisabled

      new GradientArgbColorModel(
        255, 220,38,38,    // #dc2626 0%
        255, 190,24,93,    // #be185d 100%
        255, 190,24,93,
        255, 190,24,93,
        255, 190,24,93,
        255, 190,24,93
      ), // deleteGradientButton

      new GradientArgbColorModel(
        255, 153,27,27,    // #991b1b 0%
        255, 131,24,67,    // #831843 100%
        255, 131,24,67,
        255, 131,24,67,
        255, 131,24,67,
        255, 131,24,67
      ), // deleteGradientButtonHover

      new GradientArgbColorModel(
        128, 220,38,38,    // 50% opacity
        128, 190,24,93,
        128, 190,24,93,
        128, 190,24,93,
        128, 190,24,93,
        128, 190,24,93
      ), // deleteGradientButtonDisabled

      new GradientArgbColorModel(
        255, 70,243,255,   // #46f3ff 0%
        255, 82,138,169,   // #528aa9 9.2%
        255, 87,96,134,    // #576086 45.4%
        255, 87,96,134,    // #576086 56.8%
        255, 123,100,154,  // #7b649a 79.2%
        255, 255,115,227   // #ff73e3 100%
      ), // gradientButton

      new GradientArgbColorModel(
        255, 255,115,227,  // #ff73e3 0%
        255, 123,100,154,  // #7b649a 20%
        255, 87,96,134,    // #576086 40%
        255, 82,138,169,   // #528aa9 60%
        255, 70,243,255,   // #46f3ff 80%
        255, 70,243,255    // #46f3ff 100%
      ), // gradientButtonHover

      new GradientArgbColorModel(
        128, 70,243,255,
        128, 82,138,169,
        128, 87,96,134,
        128, 87,96,134,
        128, 123,100,154,
        128, 255,115,227
      ), // gradientButtonDisabled

      new ArgbColorModel(128, 55,65,81), // buttonDisabled: #37415180
      new GradientArgbColorModel(
        255, 70,243,255,
        255, 82,138,169,
        255, 87,96,134,
        255, 87,96,134,
        255, 123,100,154,
        255, 255,115,227
      ), // buttonActive (stejný jako confirmGradientButton)
      new ArgbColorModel(255, 30, 41, 59), // secondaryButton: #1e293b
      new ArgbColorModel(255, 51, 65, 85), // secondaryButtonHover: #334155
      new ArgbColorModel(255, 51, 65, 85), // closeButtonBackground: #334155
      new ArgbColorModel(255, 71, 85, 105), // closeButtonBackgroundHover: #475569
      new ArgbColorModel(255, 255, 255, 255), // closeButtonIcon: #fff

      // BACKGROUNDS
      new ArgbColorModel(102, 0, 0, 0), // overlayBackground: rgba(0,0,0,0.4)
      new ArgbColorModel(255, 30, 41, 59), // popupBackground: #1e293b
      new GradientArgbColorModel(
        255, 50,50,50,    // #323232 0%
        255, 30,30,60,    // #1e1e3c 20%
        255, 20,20,50,    // #141432 40%
        255, 10,10,40,    // #0a0a28 60%
        255, 5,5,30,      // #05051e 80%
        255, 0,0,0        // #000000 100%
      ), // mainBackground (viz .gradient-bg ve styles.scss)
      new ArgbColorModel(255, 31, 41, 55), // sidebarBackground: #1f2937
      new ArgbColorModel(255, 35, 41, 58), // inputBackground: #23293a
      new ArgbColorModel(255, 30, 41, 59), // inputBackgroundFocus: #1e293b
      new ArgbColorModel(255, 31, 41, 55), // cardBackground: #1f2937
      new ArgbColorModel(255, 30, 41, 59), // highlightBackground: #1e293b
      new ArgbColorModel(255, 31, 41, 55), // menuBackground: #1f2937
      new ArgbColorModel(255, 31, 41, 55), // menuDropdownBackground: #1f2937
      new ArgbColorModel(255, 55, 65, 81), // menuDropdownItemHoverBackground: #374151
      new GradientArgbColorModel(
        180, 0,0,0,      // rgba(0,0,0,0.7)
        0, 0,0,0,        // transparent
        0, 0,0,0,
        0, 0,0,0,
        0, 0,0,0,
        0, 0,0,0
      ), // menuBarBackground
      new ArgbColorModel(255, 30, 41, 59), // inputBarBackground: #1e293b
      new ArgbColorModel(51, 65, 85, 51), // inputBarShadow: #33415533
      new GradientArgbColorModel(
        255, 55,65,81,   // #374151 0%
        255, 17,24,39,   // #111827 100%
        255, 17,24,39,
        255, 17,24,39,
        255, 17,24,39,
        255, 17,24,39
      ), // groupPictureBackground
      new GradientArgbColorModel(
        255, 55,65,81,   // #374151 0%
        255, 17,24,39,   // #111827 100%
        255, 17,24,39,
        255, 17,24,39,
        255, 17,24,39,
        255, 17,24,39
      ), // avatarGradientBackground
      new ArgbColorModel(255, 31, 41, 55), // messageSenderBackground: #1f2937
      new ArgbColorModel(255, 255, 255, 204), // messageAdresatorBackground: #ffffffcc (white/80)
      new ArgbColorModel(0, 0, 0, 0), // messagePreviewBackground: transparent (používá bg-black v html)
      new ArgbColorModel(255, 30, 58, 138), // messageFilePreviewBackground: #1e3a8a (blue-900)
      new ArgbColorModel(255, 71, 85, 105), // messageAvatarBackground: #475569
      new ArgbColorModel(255, 107, 114, 128), // reactionCounterBackground: #6b7280
      new ArgbColorModel(255, 55, 65, 81), // reactionPopupBackground: #374151
      new ArgbColorModel(255, 55, 65, 81), // reactionPopupItemBackground: #374151
      new ArgbColorModel(255, 71, 85, 105), // reactionPopupItemHoverBackground: #475569

      // BORDERS
      new ArgbColorModel(255, 255, 0, 255), // popupBorder: #ff00ff (dummy, override in popup)
      new GradientArgbColorModel(
        255, 70,243,255,
        255, 82,138,169,
        255, 87,96,134,
        255, 87,96,134,
        255, 123,100,154,
        255, 255,115,227
      ), // popupGradientBorder
      new GradientArgbColorModel(
        255, 70,243,255,
        255, 82,138,169,
        255, 87,96,134,
        255, 87,96,134,
        255, 123,100,154,
        255, 255,115,227
      ), // mainBorder
      new ArgbColorModel(255, 51, 65, 85), // inputBorder: #334155
      new ArgbColorModel(255, 124, 58, 237), // inputBorderFocus: #7c3aed
      new ArgbColorModel(255, 220, 38, 38), // errorBorder: #dc2626
      new ArgbColorModel(255, 55, 65, 81), // listBorder: #374151
      new ArgbColorModel(255, 100, 116, 139), // replyPreviewBarBorder: #64748b
      new ArgbColorModel(255, 55, 65, 81), // listDivider: #374151

      // TEXTS
      new ArgbColorModel(255, 255, 255, 255), // primaryText: #fff
      new ArgbColorModel(255, 203, 213, 225), // secondaryText: #cbd5e1
      new ArgbColorModel(255, 156, 163, 175), // mutedText: #9ca3af
      new ArgbColorModel(255, 156, 163, 175), // disabledText: #9ca3af
      new ArgbColorModel(255, 248, 113, 113), // dangerText: #f87171
      new ArgbColorModel(255, 34, 197, 94), // successText: #22c55e
      new ArgbColorModel(255, 255, 255, 255), // buttonText: #fff
      new ArgbColorModel(255, 255, 255, 255), // headingText: #fff
      new ArgbColorModel(255, 255, 255, 255), // messageSenderText: #fff
      new ArgbColorModel(255, 31, 41, 55), // messageAdresatorText: #1f2937
      new ArgbColorModel(255, 229, 231, 235), // messagePreviewText: #e5e7eb
      new ArgbColorModel(255, 219, 234, 254), // messageFilePreviewText: #dbeafe
      new ArgbColorModel(255, 147, 197, 253), // messageFilePreviewIcon: #93c5fd
      new ArgbColorModel(255, 255, 255, 255), // reactionCounterText: #fff
      new ArgbColorModel(255, 255, 255, 255), // reactionPopupItemText: #fff
      new ArgbColorModel(255, 255, 255, 255), // popupText: #fff
      new ArgbColorModel(255, 255, 255, 255), // inputText: #fff
      new ArgbColorModel(255, 100, 116, 139), // inputPlaceholder: #64748b
      new ArgbColorModel(255, 255, 255, 255), // fileCountCircleText: #fff
      new ArgbColorModel(255, 255, 255, 255), // menuActionText: #fff
      new ArgbColorModel(255, 156, 163, 175), // menuActionDisabledText: #9ca3af
      new ArgbColorModel(255, 248, 113, 113), // menuDeleteText: #f87171
      new ArgbColorModel(255, 255, 255, 255), // avatarIconColor: #fff

      // STATUS
      new ArgbColorModel(255, 248, 113, 113), // errorBackground: #f87171
      new ArgbColorModel(255, 34, 197, 94), // successBackground: #22c55e
      new ArgbColorModel(255, 251, 191, 36), // warningBackground: #fbbf24

      // SWITCHES & SLIDERS
      new GradientArgbColorModel(
        255, 70,243,255,
        255, 82,138,169,
        255, 87,96,134,
        255, 87,96,134,
        255, 123,100,154,
        255, 255,115,227
      ), // switchOn
      new GradientArgbColorModel(
        255, 226,232,240,
        255, 160,174,192,
        255, 160,174,192,
        255, 160,174,192,
        255, 160,174,192,
        255, 160,174,192
      ), // switchOff
      new ArgbColorModel(255, 255, 255, 255), // switchThumb: #fff
      new ArgbColorModel(0, 0, 0, 25), // switchThumbShadow: rgba(0,0,0,0.1)

      // SCROLLBARS
      new ArgbColorModel(77, 179, 179, 179), // scrollbarThumb: #b3b3b3, opacity 0.3
      new ArgbColorModel(255,179, 179, 179), // scrollbarThumbHover: #b3b3b3, opacity 1
      new ArgbColorModel(0, 0, 0, 0), // scrollbarTrack: transparent
      new ArgbColorModel(55, 65, 81, 0), // inputScrollbarTrack: #37415100
      new GradientArgbColorModel(
        255, 70,243,255,
        255, 82,138,169,
        255, 87,96,134,
        255, 87,96,134,
        255, 123,100,154,
        255, 255,115,227
      ), // inputScrollbarThumb
      new GradientArgbColorModel(
        255, 255,115,227,
        255, 153,103,171,
        255, 123,100,154,
        255, 87,96,134,
        255, 82,138,169,
        255, 70,243,255
      ), // inputScrollbarThumbHover

      // OTHERS
      new ArgbColorModel(35, 41, 58, 136), // shadow: #23293a88
      new ArgbColorModel(35, 41, 58, 136), // popupShadow: #23293a88
      new ArgbColorModel(35, 41, 58, 68), // menuShadow: #23293a44
      new ArgbColorModel(35, 41, 58, 68), // menuDropdownShadow: #23293a44
      new ArgbColorModel(124, 58, 237, 85), // buttonShadow: #7c3aed55
      new ArgbColorModel(35, 41, 58, 68), // listShadow: #23293a44
      new ArgbColorModel(35, 41, 58, 68), // messageShadow: #23293a44
      new ArgbColorModel(255, 35, 41, 58), // profilePictureBackground: #23293a
      new ArgbColorModel(0, 0, 0, 0), // fileCountCircleBackground: transparent
      new ArgbColorModel(255, 100, 116, 139), // replyPreviewBarCloseButton: #64748b
      new ArgbColorModel(255, 255, 255, 255), // replyPreviewBarCloseButtonHover: #fff
      new ArgbColorModel(255, 55, 65, 81), // messagePlaceholder: #374151
      new ArgbColorModel(255, 107, 114, 128), // messageStatusIcon: #6b7280
      new ArgbColorModel(255, 34, 211, 238), // messageStatusReadIcon: #22d3ee (cyan-400)
      new ArgbColorModel(255, 255, 255, 128), // inputSpinnerDot: rgba(255,255,255,0.5)
      new ArgbColorModel(255, 255, 255, 128), // inputSpinnerText: rgba(255,255,255,0.5)
      new ArgbColorModel(255, 55, 65, 81), // popupProgressTrack: #374151
      new ArgbColorModel(255, 124, 58, 237), // popupProgress: #7c3aed
      new ArgbColorModel(35, 41, 58, 68), // reactionPopupShadow: #23293a44
      new GradientArgbColorModel(
        255, 70,243,255,
        255, 82,138,169,
        255, 87,96,134,
        255, 87,96,134,
        255, 123,100,154,
        255, 255,115,227
      ), // menuGradientBorder
      new GradientArgbColorModel(
        255, 255,115,227,
        255, 153,103,171,
        255, 123,100,154,
        255, 87,96,134,
        255, 82,138,169,
        255, 70,243,255
      ), // menuButtonGradientHover
      new ArgbColorModel(0, 0, 0, 77), // menuButtonBackground: #0000004d (bg-black/30)
      new ArgbColorModel(255, 55, 65, 81), // menuButtonBackgroundHover: #374151
      new ArgbColorModel(255, 59, 130, 246), // menuButtonIconHover: #3b82f6
      new ArgbColorModel(255, 31, 41, 55), // menuActionBackground: #1f2937
      new ArgbColorModel(255, 55, 65, 81), // menuActionBackgroundHover: #374151
      new ArgbColorModel(255, 255, 255, 255), // menuActionIcon: #fff
      new ArgbColorModel(255, 59, 130, 246), // menuActionIconHover: #3b82f6
      new ArgbColorModel(255, 55, 65, 81), // menuActionDisabledBackground: #374151
      new ArgbColorModel(255, 156, 163, 175), // menuActionDisabledIcon: #9ca3af
      new ArgbColorModel(255, 220, 38, 38), // menuDeleteBackground: #dc2626
      new ArgbColorModel(255, 190, 24, 93), // menuDeleteBackgroundHover: #be185d
      new ArgbColorModel(255, 255, 255, 255), // menuDeleteIcon: #fff
      new ArgbColorModel(255, 255, 255, 255), // menuDeleteIconHover: #fff
      new ArgbColorModel(255, 31, 41, 55), // listBackground: #1f2937
      new ArgbColorModel(255, 51, 65, 85), // listItemHover: #334155
      new ArgbColorModel(255, 59, 130, 246), // listItemActive: #3b82f6
      new ArgbColorModel(255, 59, 130, 246) // listItemRing: #3b82f6
    );
  }
}
