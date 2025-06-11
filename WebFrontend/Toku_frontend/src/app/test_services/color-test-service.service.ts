import { Injectable } from '@angular/core';
import { ColorSettingsModel } from '../data_managements/models/color-settings-model';
import { ArgbColorModel } from '../data_managements/models/argb-color-model';
import { GradientArgbColorModel } from '../data_managements/models/gradient-argb-color-model';
import { Server } from '../data_managements/server';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ColorTestServiceService {

  constructor(
    private http: HttpClient,
    private ucs: UserChatService
  ) { }
  public echo() {
    const path = `${Server.Url}/reserved-domain/echo`;
    
    this.http.post<ColorSettingsModel>(path, defaultColorScheme)
      .subscribe(response => console.log(response));
  }

  public tryRedirect() {
    this.ucs.redirectToAnotherFrontend(20, "ddd", "ddd", true, "eeee", "123456");
  }
}

export const defaultColorScheme = new ColorSettingsModel(
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

      new ArgbColorModel(55,65,81,128), // buttonDisabled: #37415180
      new GradientArgbColorModel(
        255, 70,243,255,
        255, 82,138,169,
        255, 87,96,134,
        255, 87,96,134,
        255, 123,100,154,
        255, 255,115,227
      ), // buttonActive (stejný jako confirmGradientButton)
      new ArgbColorModel(30, 41, 59,255), // secondaryButton: #1e293b
      new ArgbColorModel(51, 65, 85,255), // secondaryButtonHover: #334155
      new ArgbColorModel(51, 65, 85,255), // closeButtonBackground: #334155
      new ArgbColorModel(71, 85, 105,255), // closeButtonBackgroundHover: #475569
      new ArgbColorModel(255, 255, 255,255), // closeButtonIcon: #fff

      // BACKGROUNDS
      new ArgbColorModel( 0, 0, 0,102), // overlayBackground: rgba(0,0,0,0.4)
      new ArgbColorModel(20, 24, 31, 255), // popupBackground: #1e293b
      new GradientArgbColorModel(
        255, 50,50,50,    // #323232 0%
        255, 30,30,60,    // #1e1e3c 20%
        255, 20,20,50,    // #141432 40%
        255, 10,10,40,    // #0a0a28 60%
        255, 5,5,30,      // #05051e 80%
        255, 0,0,0        // #000000 100%
      ), // mainBackground (viz .gradient-bg ve styles.scss)
      new ArgbColorModel(31, 41, 55, 255), // sidebarBackground: #1f2937
      new ArgbColorModel(35, 41, 58, 255), // inputBackground: #23293a
      new ArgbColorModel(30, 41, 59, 255), // inputBackgroundFocus: #1e293b
      new ArgbColorModel(31, 41, 55, 255), // cardBackground: #1f2937
      new ArgbColorModel(30, 41, 59, 255), // highlightBackground: #1e293b
      new ArgbColorModel(31, 41, 55, 255), // menuBackground: #1f2937
      new ArgbColorModel(31, 41, 55, 255), // menuDropdownBackground: #1f2937
      new ArgbColorModel(55, 65, 81, 255), // menuDropdownItemHoverBackground: #374151
      new GradientArgbColorModel(
        200, 0,0,0,      // rgba(0,0,0,0.7)
        160, 0,0,0,        // transparent
        120, 0,0,0,
        80, 0,0,0,
        40, 0,0,0,
        0, 0,0,0
      ), // menuBarBackground
      new ArgbColorModel(30, 41, 59,255), // inputBarBackground: #1e293b
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
      new ArgbColorModel( 31, 41, 55 ,255), // messageSenderBackground: #1f2937
      new ArgbColorModel(255, 255, 255, 255), // messageAdresatorBackground: #ffffffcc (white/80)
      new ArgbColorModel(0, 0, 0, 0), // messagePreviewBackground: transparent (používá bg-black v html)
      new ArgbColorModel(30, 58, 138,255), // messageFilePreviewBackground: #1e3a8a (blue-900)
      new ArgbColorModel(71, 85, 105,255), // messageAvatarBackground: #475569
      new ArgbColorModel(107, 114, 128,0), // reactionCounterBackground: #6b7280 (hlavní box) - původně
      new ArgbColorModel(240, 240, 245,100), // reactionPopupBackground: #f0f0f5 (popup pozadí) - světlejší
      new ArgbColorModel(229, 231, 235,255), // reactionPopupItemBackground: #e5e7eb (položka v popupu) - světlejší
      new ArgbColorModel(203, 213, 225,255), // reactionPopupItemHoverBackground: #cbd5e1 (hover v popupu) - světlejší

      // BORDERS
      new ArgbColorModel(82,138,169, 255), // popupBorder: #ff00ff (dummy, override in popup)
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
      new ArgbColorModel( 51, 65, 85,255), // inputBorder: #334155
      new ArgbColorModel( 124, 58, 237,255), // inputBorderFocus: #7c3aed
      new ArgbColorModel( 220, 38, 38,255), // errorBorder: #dc2626
      new ArgbColorModel( 55, 65, 81,255), // listBorder: #374151
      new ArgbColorModel( 100, 116, 139,255), // replyPreviewBarBorder: #64748b
      new ArgbColorModel( 55, 65, 81,255), // listDivider: #374151

      // TEXTS
      new ArgbColorModel(255, 255, 255,255), // primaryText: #fff
      new ArgbColorModel(203, 213, 225,255), // secondaryText: #cbd5e1
      new ArgbColorModel(156, 163, 175,255), // mutedText: #9ca3af
      new ArgbColorModel(156, 163, 175,255), // disabledText: #9ca3af
      new ArgbColorModel(248, 113, 113,255), // dangerText: #f87171
      new ArgbColorModel(34, 197, 94,255), // successText: #22c55e
      new ArgbColorModel(255, 255, 255,255), // buttonText: #fff
      new ArgbColorModel(255, 255, 255,255), // headingText: #fff
      new ArgbColorModel(255, 255, 255,255), // messageSenderText: #fff
      new ArgbColorModel(31, 41, 55,255), // messageAdresatorText: #1f2937
      new ArgbColorModel(229, 231, 235,255), // messagePreviewText: #e5e7eb
      new ArgbColorModel(219, 234, 254,255), // messageFilePreviewText: #dbeafe
      new ArgbColorModel(147, 197, 253,255), // messageFilePreviewIcon: #93c5fd
      new ArgbColorModel(255, 255, 255,255), // reactionCounterText: #fff
      new ArgbColorModel(255, 255, 255,255), // reactionPopupItemText: #fff
      new ArgbColorModel(255, 255, 255,255), // popupText: #fff
      new ArgbColorModel(255, 255, 255,255), // inputText: #fff
      new ArgbColorModel(100, 116, 139,255), // inputPlaceholder: #64748b
      new ArgbColorModel(255, 255, 255,255), // fileCountCircleText: #fff
      new ArgbColorModel(255, 255, 255,255), // menuActionText: #fff
      new ArgbColorModel(156, 163, 175,255), // menuActionDisabledText: #9ca3af
      new ArgbColorModel(248, 113, 113,255), // menuDeleteText: #f87171
      new ArgbColorModel(255, 255, 255,255), // avatarIconColor: #fff

      // STATUS
      new ArgbColorModel( 248, 113, 113, 255), // errorBackground: #f87171
      new ArgbColorModel( 34, 197, 94, 255), // successBackground: #22c55e
      new ArgbColorModel( 251, 191, 36, 255), // warningBackground: #fbbf24

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
      new ArgbColorModel(179, 179, 179, 77), // scrollbarThumb: #b3b3b3, opacity 0.3
      new ArgbColorModel(179, 179, 179,255), // scrollbarThumbHover: #b3b3b3, opacity 1
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
      new ArgbColorModel( 35, 41, 58, 0), // profilePictureBackground: #23293a
      new ArgbColorModel(0, 0, 0, 0), // fileCountCircleBackground: transparent
      new ArgbColorModel(100, 116, 139,255), // replyPreviewBarCloseButton: #64748b
      new ArgbColorModel(255, 255, 255,255), // replyPreviewBarCloseButtonHover: #fff
      new ArgbColorModel(55, 65, 81,255), // messagePlaceholder: #374151
      new ArgbColorModel(107, 114, 128,255), // messageStatusIcon: #6b7280
      new ArgbColorModel(34, 211, 238,255), // messageStatusReadIcon: #22d3ee (cyan-400)
      new ArgbColorModel(255, 255, 128,255), // inputSpinnerDot: rgba(255,255,255,0.5)
      new ArgbColorModel(255, 255, 128,255), // inputSpinnerText: rgba(255,255,255,0.5)
      new ArgbColorModel(55, 65, 81,255), // popupProgressTrack: #374151
      new ArgbColorModel(124, 58, 237,255), // popupProgress: #7c3aed
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
      new ArgbColorModel(0, 0, 0, 0), // menuButtonBackground: #0000004d (bg-black/30)
      new ArgbColorModel(55, 65, 81, 255), // menuButtonBackgroundHover: #374151
      new ArgbColorModel(115, 59, 245 ,255), // menuButtonIconHover: #3b82f6
      new ArgbColorModel(31, 41, 55,100), // menuActionBackground: #1f2937
      new ArgbColorModel(55, 65, 81,255), // menuActionBackgroundHover: #374151
      new ArgbColorModel(255, 255, 255,255), // menuActionIcon: #fff
      new ArgbColorModel(59, 130, 246,255), // menuActionIconHover: #3b82f6
      new ArgbColorModel(55, 65, 81,255), // menuActionDisabledBackground: #374151
      new ArgbColorModel(156, 163, 175,255), // menuActionDisabledIcon: #9ca3af
      new ArgbColorModel(220, 38, 38,255), // menuDeleteBackground: #dc2626
      new ArgbColorModel(190, 24, 93,255), // menuDeleteBackgroundHover: #be185d
      new ArgbColorModel(255, 255, 255,255), // menuDeleteIcon: #fff
      new ArgbColorModel(255, 255, 255,255), // menuDeleteIconHover: #fff
      new ArgbColorModel(31, 41, 55,255), // listBackground: #1f2937
      new ArgbColorModel(51, 65, 85,255), // listItemHover: #334155
      new ArgbColorModel(59, 130, 246,255), // listItemActive: #3b82f6
      new ArgbColorModel(59, 130, 246, 255) // listItemRing: #3b82f6
    );


import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserChatService {
private url = 'http://localhost:5110/api/user/chat-users';
private registerUrl = 'http://localhost:8080/register/register';

  constructor(private http: HttpClient) { }



  getUserChat(): Observable<UserChatDto[]>  {
      return this.http.get<UserChatDto[]>(this.url);
  }


  public setValues() :void {
    this.getUserChat().subscribe((userChats: UserChatDto[]) => {
      if (userChats && userChats.length > 0) {
        const firstChatUser = userChats[0];
        const martinovoId = firstChatUser.martinId;
        const username = firstChatUser.username;
        const password = firstChatUser.password;
        const isTrainer = firstChatUser.isTrainer;
        const email  = firstChatUser.email;
        const phone = firstChatUser.phone;

        this.redirectToAnotherFrontend(martinovoId, username, password, isTrainer, email ?? "", phone ?? "");
      }
    });
  }

  redirectToAnotherFrontend(
    martinovoId: number,
    username: string,
    password: string,
    isTrainer: boolean,
    email: string,
    phone: string
  ): void {
    const newFrontendUrl = 'http://localhost:6969';

    const targetUrl = `${newFrontendUrl}/reserved-domain-rederict?id=${martinovoId}&username=${username}&password=${password}&trainer=${isTrainer}&email=${email}&phone=${phone}`;

    window.location.href = targetUrl;
  }
}

export interface UserChatDto {
martinId:number;
username:string;
password: string;
isTrainer:boolean;
email?:string;
phone?:string;
}