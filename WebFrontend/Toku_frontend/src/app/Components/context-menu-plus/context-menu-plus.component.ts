import { Component, ElementRef, HostListener, ViewChild, AfterViewInit } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';
import { ContextMenuPlusService, ContextMenuPlusConfig } from '../../services/context-menu-plus.service';
import { ColorManagerService } from '../../services/color-manager.service';
import { ColorSettingsModel } from '../../data_managements/models/color-settings-model';

@Component({
  selector: 'app-context-menu-plus',
  standalone: true,
  imports: [NgIf, NgStyle],
  templateUrl: './context-menu-plus.component.html',
  styleUrls: ['./context-menu-plus.component.scss']
})
export class ContextMenuPlusComponent implements AfterViewInit {
  config: ContextMenuPlusConfig = {
    visible: false,
    x: 0,
    y: 0,
    actions: {
      groupSettings: () => { },
      chatLogin: () => { },
    }
  };

  @ViewChild('menu', { static: false }) menuRef!: ElementRef;
  public csm: ColorSettingsModel;

  constructor(
    public menuService: ContextMenuPlusService,
    private colorManager: ColorManagerService,
    private el: ElementRef
  ) {
    this.menuService.config$.subscribe(cfg => this.config = cfg);
    this.csm = this.colorManager.csm;
  }

  ngAfterViewInit() {
    if (!this.csm) return;
    const root = this.el.nativeElement ?? document.querySelector('app-context-menu-plus') ?? document.documentElement;
    const setVar = (name: string, value: string) => root.style.setProperty(name, value);

    const csm = this.csm;
    setVar('--menu-bg', csm.menuActionBackground.toRgbaString());
    setVar('--menu-shadow', csm.menuShadow.toRgbaString());
    setVar('--menu-text', csm.menuActionText.toRgbaString());
    setVar('--menu-hover-bg', csm.menuActionBackgroundHover.toRgbaString());
    setVar('--menu-hover-text', csm.menuActionIconHover.toRgbaString());
    setVar('--menu-disabled-text', csm.menuActionDisabledText.toRgbaString());
    setVar('--menu-delete-text', csm.menuDeleteText.toRgbaString());
    setVar('--menu-delete-bg', csm.menuDeleteBackground.toRgbaString());
    setVar('--menu-delete-hover-bg', csm.menuDeleteBackgroundHover.toRgbaString());
    setVar('--menu-delete-icon', csm.menuDeleteIcon.toRgbaString());
    setVar('--menu-delete-icon-hover', csm.menuDeleteIconHover.toRgbaString());
    setVar('--menu-action-icon', csm.menuActionIcon.toRgbaString());
    setVar('--menu-action-icon-hover', csm.menuActionIconHover.toRgbaString());
  }

  get menuStyle() {
    const menuWidth = 192;
    const menuHeight = 120;
    const padding = 8;
    let left = this.config?.x ?? 0;
    let top = this.config?.y ?? 0;
    if (left + menuWidth + padding > window.innerWidth) {
      left = window.innerWidth - menuWidth - padding;
    }
    if (top + menuHeight + padding > window.innerHeight) {
      top = window.innerHeight - menuHeight - padding;
    }
    left = Math.max(left, 0);
    top = Math.max(top, 0);
    return {
      position: 'fixed',
      left: left + 'px',
      top: top + 'px',
      zIndex: 9999
    };
  }

  onMenuItemClick(action: () => void, event: Event) {
    this.menuService.close();
    action();
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.config.visible) {
      const menuEl = this.menuRef?.nativeElement;
      if (menuEl && !menuEl.contains(event.target)) {
        this.menuService.close();
      }
    }
  }
}