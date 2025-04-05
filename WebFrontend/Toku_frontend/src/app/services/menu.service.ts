import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root', // Ensure the service is provided in the root injector
})
export class MenuService {
  public showDropdown = true; // Manage chat menu visibility
  public isVisible = true; // Manage animation state

  private activeMenu: any = null;

  setActiveMenu(menu: any): void {
    if (this.activeMenu && this.activeMenu !== menu) {
      this.activeMenu.menuVisible = false; // Close the previously active menu
    }
    this.activeMenu = menu; // Set the new active menu
  }

  closeMenu(): void {
    if (this.activeMenu) {
      this.activeMenu.menuVisible = false; // Close the active menu
      this.activeMenu = null;
    }
    this.showDropdown = false; // Ensure the dropdown is closed
    this.isVisible = false; // Update animation state
  }
}
