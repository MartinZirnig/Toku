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
  // === BUTTONS ===
  new GradientArgbColorModel(255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43),
  new GradientArgbColorModel(255, 100, 65, 220, 255, 120, 200, 30, 255, 100, 65, 220, 255, 120, 200, 30, 255, 100, 65, 220, 255, 120, 200, 30),
  new GradientArgbColorModel(100, 120, 85, 240, 100, 140, 226, 43, 100, 120, 85, 240, 100, 140, 226, 43, 100, 120, 85, 240, 100, 140, 226, 43),
  new GradientArgbColorModel(255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43),
  new GradientArgbColorModel(255, 100, 65, 220, 255, 120, 200, 30, 255, 100, 65, 220, 255, 120, 200, 30, 255, 100, 65, 220, 255, 120, 200, 30),
  new GradientArgbColorModel(100, 120, 85, 240, 100, 140, 226, 43, 100, 120, 85, 240, 100, 140, 226, 43, 100, 120, 85, 240, 100, 140, 226, 43),
  new GradientArgbColorModel(255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43),
  new GradientArgbColorModel(255, 100, 65, 220, 255, 120, 200, 30, 255, 100, 65, 220, 255, 120, 200, 30, 255, 100, 65, 220, 255, 120, 200, 30),
  new GradientArgbColorModel(100, 120, 85, 240, 100, 140, 226, 43, 100, 120, 85, 240, 100, 140, 226, 43, 100, 120, 85, 240, 100, 140, 226, 43),
  new ArgbColorModel(75, 75, 76, 255), // buttonDisabled
  new GradientArgbColorModel(255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43), // buttonActive
  new ArgbColorModel(75, 75, 76, 255), // secondaryButton
  new ArgbColorModel( 33, 37, 41, 255), // secondaryButtonHover
  new ArgbColorModel( 33, 37, 41, 255), // closeButtonBackground
  new ArgbColorModel(75, 75, 76, 255),  // closeButtonBackgroundHover
  new ArgbColorModel( 248, 249, 250, 255), // closeButtonIcon

  // === BACKGROUNDS ===
  new ArgbColorModel( 0, 0, 0, 255), // overlayBackground
  new ArgbColorModel( 33, 37, 41, 255),// popupBackground
  new GradientArgbColorModel(255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43), // mainBackground
  new ArgbColorModel( 33, 37, 41, 255), // sidebarBackground
  new ArgbColorModel(75, 75, 76, 255),  // inputBackground
  new ArgbColorModel( 33, 37, 41, 255), // inputBackgroundFocus
  new ArgbColorModel( 33, 37, 41, 255), // cardBackground
  new ArgbColorModel( 33, 37, 41, 255), // highlightBackground
  new ArgbColorModel( 33, 37, 41, 255), // menuBackground
  new ArgbColorModel(75, 75, 76, 255),  // menuDropdownBackground
  new ArgbColorModel( 33, 37, 41, 255), // menuDropdownItemHoverBackground
  new GradientArgbColorModel(255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43), // menuBarBackground
  new ArgbColorModel( 33, 37, 41, 255), // inputBarBackground
  new ArgbColorModel( 33, 37, 41, 255), // inputBarShadow
  new GradientArgbColorModel(255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43), // groupPictureBackground
  new GradientArgbColorModel(255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43), // avatarGradientBackground
  new ArgbColorModel( 33, 37, 41, 255),// messageSenderBackground
  new ArgbColorModel( 33, 37, 41, 255), // messageAdresatorBackground
  new ArgbColorModel( 33, 37, 41, 255),// messagePreviewBackground
  new ArgbColorModel(75, 75, 76, 255),  // messageFilePreviewBackground
  new ArgbColorModel( 248, 249, 250, 255), // messageAvatarBackground
  new ArgbColorModel(75, 75, 76, 255),  // reactionCounterBackground
  new ArgbColorModel( 33, 37, 41, 255), // reactionPopupBackground
  new ArgbColorModel( 33, 37, 41, 255),// reactionPopupItemBackground
  new ArgbColorModel( 33, 37, 41, 255),// reactionPopupItemHoverBackground

  // === BORDERS ===
  new ArgbColorModel( 33, 37, 41, 255), // popupBorder
  new GradientArgbColorModel(255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43), // popupGradientBorder
  new GradientArgbColorModel(255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43), // mainBorder
  new ArgbColorModel(75, 75, 76, 255),  // inputBorder
  new ArgbColorModel(75, 75, 76, 255),  // inputBorderFocus
  new ArgbColorModel( 255, 0, 0, 255), // errorBorder
  new ArgbColorModel( 33, 37, 41, 255), // listBorder
  new ArgbColorModel(75, 75, 76, 255),  // replyPreviewBarBorder
  new ArgbColorModel( 33, 37, 41, 255), // listDivider

  // === TEXTS ===
  new ArgbColorModel( 248, 249, 250, 255),// primaryText
  new ArgbColorModel(75, 75, 76, 255), // secondaryText
  new ArgbColorModel(75, 75, 76, 255),  // mutedText
  new ArgbColorModel(75, 75, 76, 255), // disabledText
  new ArgbColorModel( 255, 0, 0, 255), // dangerText
  new ArgbColorModel(140, 226, 43, 255), // successText
  new ArgbColorModel( 248, 249, 250, 255), // buttonText
  new ArgbColorModel( 248, 249, 250, 255), // headingText
  new ArgbColorModel( 248, 249, 250, 255),// messageSenderText
  new ArgbColorModel( 248, 249, 250, 255), // messageAdresatorText
  new ArgbColorModel( 248, 249, 250, 255), // messagePreviewText
  new ArgbColorModel( 248, 249, 250, 255),// messageFilePreviewText
  new ArgbColorModel( 248, 249, 250, 255),// messageFilePreviewIcon
  new ArgbColorModel( 248, 249, 250, 255),// reactionCounterText
  new ArgbColorModel( 248, 249, 250, 255), // reactionPopupItemText
  new ArgbColorModel( 248, 249, 250, 255), // popupText
  new ArgbColorModel( 248, 249, 250, 255),// inputText
  new ArgbColorModel( 248, 249, 250, 255),// inputPlaceholder
  new ArgbColorModel( 248, 249, 250, 255), // fileCountCircleText
  new ArgbColorModel( 248, 249, 250, 255), // menuActionText
  new ArgbColorModel( 248, 249, 250, 255), // menuActionDisabledText
  new ArgbColorModel( 248, 249, 250, 255), // menuDeleteText
  new ArgbColorModel( 248, 249, 250, 255), // avatarIconColor

  // === STATUS ===
  new ArgbColorModel(255, 255, 0, 0), // errorBackground
  new ArgbColorModel(140, 226, 43, 255),// successBackground
  new ArgbColorModel( 248, 249, 250, 255),// warningBackground

  // === SWITCHES ===
  new GradientArgbColorModel(255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43),
  new GradientArgbColorModel(255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43),
  new ArgbColorModel(75, 75, 76, 255),  // switchThumb
  new ArgbColorModel(75, 75, 76, 255),  // switchThumbShadow

  // === SCROLLBARS ===
  new ArgbColorModel(75, 75, 76, 255),
  new ArgbColorModel(75, 75, 76, 255),
  new ArgbColorModel(75, 75, 76, 255),
  new ArgbColorModel(75, 75, 76, 255),
  new GradientArgbColorModel(255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43),
  new GradientArgbColorModel(255, 100, 65, 220, 255, 120, 200, 30, 255, 100, 65, 220, 255, 120, 200, 30, 255, 100, 65, 220, 255, 120, 200, 30),

  // === OTHERS ===
  new ArgbColorModel(75, 75, 76, 255),  // shadow
  new ArgbColorModel(75, 75, 76, 255), // popupShadow
  new ArgbColorModel( 33, 37, 41, 255), // menuShadow
  new ArgbColorModel(75, 75, 76, 255),  // menuDropdownShadow
  new ArgbColorModel( 33, 37, 41, 255),// buttonShadow
  new ArgbColorModel(75, 75, 76, 255),  // listShadow
  new ArgbColorModel( 33, 37, 41, 255), // messageShadow
  new ArgbColorModel(75, 75, 76, 255),  // profilePictureBackground
  new ArgbColorModel(75, 75, 76, 255),  // fileCountCircleBackground
  new ArgbColorModel(75, 75, 76, 255),  // replyPreviewBarCloseButton
  new ArgbColorModel(75, 75, 76, 255),  // replyPreviewBarCloseButtonHover
  new ArgbColorModel(75, 75, 76, 255), // messagePlaceholder
  new ArgbColorModel( 248, 249, 250, 255), // messageStatusIcon
  new ArgbColorModel( 248, 249, 250, 255), // messageStatusReadIcon
  new ArgbColorModel(75, 75, 76, 255), // inputSpinnerDot
  new ArgbColorModel( 248, 249, 250, 255), // inputSpinnerText
  new ArgbColorModel(75, 75, 76, 255), // popupProgressTrack
  new ArgbColorModel(140, 226, 43, 255), // popupProgress
  new ArgbColorModel(75, 75, 76, 255),  // reactionPopupShadow
  new GradientArgbColorModel(255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43, 255, 120, 85, 240, 255, 140, 226, 43), // menuGradientBorder
  new GradientArgbColorModel(255, 100, 65, 220, 255, 120, 200, 30, 255, 100, 65, 220, 255, 120, 200, 30, 255, 100, 65, 220, 255, 120, 200, 30), // menuButtonGradientHover
  new ArgbColorModel(75, 75, 76, 255),
  new ArgbColorModel(75, 75, 76, 255),
  new ArgbColorModel( 248, 249, 250, 255),
  new ArgbColorModel(75, 75, 76, 255),
  new ArgbColorModel(75, 75, 76, 255),
  new ArgbColorModel( 248, 249, 250, 255),
  new ArgbColorModel(75, 75, 76, 255),
  new ArgbColorModel( 248, 249, 250, 255),
  new ArgbColorModel(75, 75, 76, 255),
  new ArgbColorModel( 33, 37, 41, 255),
  new ArgbColorModel(75, 75, 76, 255),
  new ArgbColorModel(140, 226, 43, 255),
  new ArgbColorModel(140, 226, 43, 255),
  new ArgbColorModel(75, 75, 76, 255),
  new ArgbColorModel(140, 226, 43, 255),
  new ArgbColorModel(140, 226, 43, 255),
  new ArgbColorModel(140, 226, 43, 255),
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