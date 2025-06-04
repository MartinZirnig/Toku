import { ArgbColorModel } from "./argb-color-model";
import { GradientArgbColorModel } from "./gradient-argb-color-model";

export class ColorSettingsModel 
{
    constructor(
        // BUTTONS – Used in: file-form, user-settings, group-settings, chat-login, add-contact-popup, chat-login-popup-group-list, are-you-sure-pop-up, delete-popup
        // Gradientní tlačítka pro hlavní akce (potvrzení, přidání, odeslání)
        public confirmGradientButton: GradientArgbColorModel,           // Used in: file-form (confirm-btn), group-settings (add-member-btn), chat-login (submit), add-contact-popup (gradient-btn), chat-login-popup-group-list (gradient-btn), are-you-sure-pop-up (yes/update), delete-popup (delete-for-me, delete-for-all)
        public confirmGradientButtonHover: GradientArgbColorModel,      // Used in: file-form (confirm-btn:hover), group-settings (add-member-btn:hover), chat-login (submit:hover), add-contact-popup (gradient-btn:hover), chat-login-popup-group-list (gradient-btn:hover)
        public confirmGradientButtonDisabled: GradientArgbColorModel,   // Used in: disabled stav hlavních tlačítek (pokud někde bude potřeba)
        public deleteGradientButton: GradientArgbColorModel,            // Used in: delete-popup (delete-for-all), are-you-sure-pop-up (yes)
        public deleteGradientButtonHover: GradientArgbColorModel,       // Used in: delete-popup (delete-for-all:hover), are-you-sure-pop-up (yes:hover)
        public deleteGradientButtonDisabled: GradientArgbColorModel,    // Used in: delete-popup (delete-for-all:disabled)
        public gradientButton: GradientArgbColorModel,                  // Used in: user-finder (gradient-btn), add-contact-popup (gradient-btn), chat-login-popup-group-list (gradient-btn)
        public gradientButtonHover: GradientArgbColorModel,             // Used in: user-finder (gradient-btn:hover), add-contact-popup (gradient-btn:hover), chat-login-popup-group-list (gradient-btn:hover)
        public gradientButtonDisabled: GradientArgbColorModel,          // Used in: user-finder (gradient-btn:disabled), add-contact-popup (gradient-btn:disabled)
        public buttonDisabled: ArgbColorModel,                          // Used in: disabled stav (obecně)
        public buttonActive: GradientArgbColorModel,                    // Used in: aktivní stav (obecně)
        public secondaryButton: ArgbColorModel,                         // Used in: are-you-sure-pop-up (no), delete-popup (close), file-download (download-btn)
        public secondaryButtonHover: ArgbColorModel,                    // Used in: are-you-sure-pop-up (no:hover), delete-popup (close:hover), file-download (download-btn:hover)
        public closeButtonBackground: ArgbColorModel,                   // Used in: všechny popupy (close btn)
        public closeButtonBackgroundHover: ArgbColorModel,              // Used in: všechny popupy (close btn:hover)
        public closeButtonIcon: ArgbColorModel,                         // Used in: všechny popupy (close btn svg)

        // BACKGROUNDS – Used in: všechny popupy, hlavní panely, inputy, message boxy
        public overlayBackground: ArgbColorModel,                       // Used in: všechny popupy (overlay bg-black/40, bg-black/50)
        public popupBackground: ArgbColorModel,                         // Used in: všechny popupy (pozadí)
        public mainBackground: GradientArgbColorModel,                  // Used in: hlavní panely, pozadí aplikace
        public sidebarBackground: ArgbColorModel,                       // Used in: user-settings (sidebar), group-settings (sidebar)
        public inputBackground: ArgbColorModel,                         // Used in: input-ui (textarea), user-settings (input), group-settings (input), chat-login (input), add-contact-popup (search)
        public inputBackgroundFocus: ArgbColorModel,                    // Used in: input-ui (textarea:focus), chat-login (input:focus)
        public cardBackground: ArgbColorModel,                          // Used in: message-adresator, message_sender, dummy-message-adresator, dummy-message-sender (message boxy)
        public highlightBackground: ArgbColorModel,                     // Used in: user-settings (li:hover), add-contact-popup (li:hover), chat-login-popup-group-list (li:hover), group-settings (member-item.selected), chat-menu-ui (active chat-item)
        public menuBackground: ArgbColorModel,                          // Used in: chat-menu-ui (sidebar)
        public menuDropdownBackground: ArgbColorModel,                  // Used in: menu-ui (dropdown)
        public menuDropdownItemHoverBackground: ArgbColorModel,         // Used in: menu-ui (dropdown:hover)
        public menuBarBackground: GradientArgbColorModel,               // Used in: menu-ui (horní panel)
        public inputBarBackground: ArgbColorModel,                      // Used in: input-ui (input bar)
        public inputBarShadow: ArgbColorModel,                          // Used in: input-ui (input bar shadow)
        public groupPictureBackground: GradientArgbColorModel,          // Used in: group-settings (group-picture-rectangle), user-settings (group-picture-rectangle)
        public avatarGradientBackground: GradientArgbColorModel,        // Used in: profile-picture-circled (avatar-svg)
        public messageSenderBackground: ArgbColorModel,                 // Used in: message_sender (bublina)
        public messageAdresatorBackground: ArgbColorModel,              // Used in: message-adresator (bublina)
        public messagePreviewBackground: ArgbColorModel,                // Used in: message preview (bg-black)
        public messageFilePreviewBackground: ArgbColorModel,            // Used in: file preview (bg-blue-900)
        public messageAvatarBackground: ArgbColorModel,                 // Used in: avatar v bublině zprávy
        public reactionCounterBackground: ArgbColorModel,               // Used in: reaction-counter (hlavní kontejner)
        public reactionPopupBackground: ArgbColorModel,                 // Used in: reaction-counter (popup)
        public reactionPopupItemBackground: ArgbColorModel,             // Used in: reaction-counter (položka v popupu)
        public reactionPopupItemHoverBackground: ArgbColorModel,        // Used in: reaction-counter (položka v popupu:hover)

        // BORDERS – Used in: popupy, inputy, seznamy
        public popupBorder: ArgbColorModel,                             // Used in: všechny popupy (border)
        public popupGradientBorder: GradientArgbColorModel,             // Used in: všechny popupy (gradient border)
        public mainBorder: GradientArgbColorModel,                      // Used in: hlavní panely (border gradient)
        public inputBorder: ArgbColorModel,                             // Used in: input-ui (textarea), chat-login (input), user-settings (input), group-settings (input)
        public inputBorderFocus: ArgbColorModel,                        // Used in: input-ui (textarea:focus), chat-login (input:focus)
        public errorBorder: ArgbColorModel,                             // Used in: user-settings (input:invalid), group-settings (input:invalid)
        public listBorder: ArgbColorModel,                              // Used in: user-settings (contacts list), add-contact-popup (ul), chat-login-popup-group-list (ul), file-form (ul), file-download (ul)
        public replyPreviewBarBorder: ArgbColorModel,                   // Used in: input-ui (reply preview bar)
        public listDivider: ArgbColorModel,                             // Used in: seznamy (divide-y, border-gray-700)

        // TEXTS – Used in: všechny komponenty
        public primaryText: ArgbColorModel,                             // Used in: většina textů (text-white)
        public secondaryText: ArgbColorModel,                           // Used in: popisky, sekundární texty (text-gray-400)
        public mutedText: ArgbColorModel,                               // Used in: disabled stavy, placeholdery (text-gray-500, text-gray-400)
        public disabledText: ArgbColorModel,                            // Used in: disabled stavy, placeholdery (text-gray-500, text-gray-400)
        public dangerText: ArgbColorModel,                              // Used in: error hlášky (text-red-500), delete-popup, are-you-sure-pop-up
        public successText: ArgbColorModel,                             // Used in: success hlášky (pokud někde bude potřeba)
        public buttonText: ArgbColorModel,                              // Used in: tlačítka (text-white)
        public headingText: ArgbColorModel,                             // Used in: nadpisy (text-white)
        public messageSenderText: ArgbColorModel,                       // Used in: message_sender (text)
        public messageAdresatorText: ArgbColorModel,                    // Used in: message-adresator (text)
        public messagePreviewText: ArgbColorModel,                      // Used in: message preview (text-gray-200)
        public messageFilePreviewText: ArgbColorModel,                  // Used in: file preview (text-blue-100)
        public messageFilePreviewIcon: ArgbColorModel,                  // Used in: file preview (text-blue-300)
        public reactionCounterText: ArgbColorModel,                     // Used in: reaction-counter (text/emoji)
        public reactionPopupItemText: ArgbColorModel,                   // Used in: reaction-counter (popup text)
        public popupText: ArgbColorModel,                               // Used in: pop-up (text)
        public inputText: ArgbColorModel,                               // Used in: input-ui (textarea text)
        public inputPlaceholder: ArgbColorModel,                        // Used in: input-ui (placeholder)
        public fileCountCircleText: ArgbColorModel,                     // Used in: input-ui (file count circle)
        public menuActionText: ArgbColorModel,                          // Used in: context-menu (text)
        public menuActionDisabledText: ArgbColorModel,                  // Used in: context-menu (disabled text)
        public menuDeleteText: ArgbColorModel,                          // Used in: context-menu (delete text)
        public avatarIconColor: ArgbColorModel,                         // Used in: profile-picture-circled (avatar-svg)

        // STATUS – Used in: validace, notifikace, stavy
        public errorBackground: ArgbColorModel,                         // Used in: error hlášky, input error background
        public successBackground: ArgbColorModel,                       // Used in: success hlášky, input success background
        public warningBackground: ArgbColorModel,                       // Used in: warning hlášky

        // SWITCHES & SLIDERS – Used in: user-settings (AI bot switch), group-settings (permissions switch)
        public switchOn: GradientArgbColorModel,                        // Used in: user-settings (.switch:checked), group-settings (.switch:checked)
        public switchOff: GradientArgbColorModel,                       // Used in: user-settings (.switch), group-settings (.switch)
        public switchThumb: ArgbColorModel,                             // Used in: user-settings (.slider::after), group-settings (.slider::after)
        public switchThumbShadow: ArgbColorModel,                       // Used in: user-settings (.slider::after), group-settings (.slider::after)

        // SCROLLBARS – Used in: všechny scrollovatelné seznamy
        public scrollbarThumb: ArgbColorModel,                          // Used in: user-finder, file-form, chat-menu-ui, group-settings, input-ui, etc.
        public scrollbarThumbHover: ArgbColorModel,                     // Used in: user-finder, file-form, chat-menu-ui, group-settings, input-ui, etc.
        public scrollbarTrack: ArgbColorModel,                          // Used in: user-finder, file-form, chat-menu-ui, group-settings, input-ui, etc.
        public inputScrollbarTrack: ArgbColorModel,                     // Used in: input-ui (custom scrollbar)
        public inputScrollbarThumb: GradientArgbColorModel,             // Used in: input-ui (custom scrollbar)
        public inputScrollbarThumbHover: GradientArgbColorModel,        // Used in: input-ui (custom scrollbar:hover)

        // OTHERS – Used in: specifické prvky
        public shadow: ArgbColorModel,                                  // Used in: všechny popupy, tlačítka (box-shadow)
        public popupShadow: ArgbColorModel,                             // Used in: všechny popupy (stín)
        public menuShadow: ArgbColorModel,                              // Used in: chat-menu-ui (shadow)
        public menuDropdownShadow: ArgbColorModel,                      // Used in: menu-ui (dropdown shadow)
        public buttonShadow: ArgbColorModel,                            // Used in: tlačítka (box-shadow)
        public listShadow: ArgbColorModel,                              // Used in: seznamy (pokud je potřeba)
        public messageShadow: ArgbColorModel,                           // Used in: zprávy (box-shadow)
        public profilePictureBackground: ArgbColorModel,                // Used in: profile-picture-circled (pozadí)
        public fileCountCircleBackground: ArgbColorModel,               // Used in: input-ui (file count circle)
        public replyPreviewBarCloseButton: ArgbColorModel,              // Used in: input-ui (reply preview bar close btn)
        public replyPreviewBarCloseButtonHover: ArgbColorModel,         // Used in: input-ui (reply preview bar close btn:hover)
        public messagePlaceholder: ArgbColorModel,                      // Used in: dummy-message-adresator (placeholder v bublině)
        public messageStatusIcon: ArgbColorModel,                       // Used in: message_sender (čas/checkmark)
        public messageStatusReadIcon: ArgbColorModel,                   // Used in: message_sender (checkmark přečteno)
        public inputSpinnerDot: ArgbColorModel,                         // Used in: input-ui (spinner dot)
        public inputSpinnerText: ArgbColorModel,                        // Used in: input-ui (spinner text)
        public popupProgressTrack: ArgbColorModel,                      // Used in: pop-up (progress track)
        public popupProgress: ArgbColorModel,                           // Used in: pop-up (progress)
        public reactionPopupShadow: ArgbColorModel,                     // Used in: reaction-counter (popup shadow)
        public menuGradientBorder: GradientArgbColorModel,              // Used in: chat-menu-ui (gradient border)
        public menuButtonGradientHover: GradientArgbColorModel,         // Used in: menu-ui (menu-btn-gradient:hover)
        public menuButtonBackground: ArgbColorModel,                    // Used in: menu-ui (menu-btn-gradient)
        public menuButtonBackgroundHover: ArgbColorModel,               // Used in: menu-ui (menu-btn-gradient:hover)
        public menuButtonIconHover: ArgbColorModel,                     // Used in: menu-ui (menu-btn-gradient:hover svg)
        public menuActionBackground: ArgbColorModel,                    // Used in: context-menu (action bg)
        public menuActionBackgroundHover: ArgbColorModel,               // Used in: context-menu (action bg:hover)
        public menuActionIcon: ArgbColorModel,                          // Used in: context-menu (action icon)
        public menuActionIconHover: ArgbColorModel,                     // Used in: context-menu (action icon:hover)
        public menuActionDisabledBackground: ArgbColorModel,            // Used in: context-menu (disabled bg)
        public menuActionDisabledIcon: ArgbColorModel,                  // Used in: context-menu (disabled icon)
        public menuDeleteBackground: ArgbColorModel,                    // Used in: context-menu (delete bg)
        public menuDeleteBackgroundHover: ArgbColorModel,               // Used in: context-menu (delete bg:hover)
        public menuDeleteIcon: ArgbColorModel,                          // Used in: context-menu (delete icon)
        public menuDeleteIconHover: ArgbColorModel,                     // Used in: context-menu (delete icon:hover)
        public listBackground: ArgbColorModel,                          // Used in: seznamy (pozadí)
        public listItemHover: ArgbColorModel,                           // Used in: seznamy (li:hover)
        public listItemActive: ArgbColorModel,                          // Used in: seznamy (li.active)
        public listItemRing: ArgbColorModel,                            // Used in: seznamy (li.ring)
    ) {}


}