import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Redirecter {

  constructor(private router: Router) { }

  public Register() {
    this.router.navigate(['register']);
 }
 public Login() {
   this.router.navigate(['login']);
 }
 public ChangePassword() {
   this.router.navigate(['chagepass']);
 }
 public Settings() {
  this.router.navigate(['/main/user-settings']);
 }
 
 public Group(groupId: number) {
    this.router.navigate(['main'], { fragment: String(groupId)});
  }
  public Chat(chatId: number) {
    this.router.navigate(['main'], { fragment: String(chatId) });
  }
}
