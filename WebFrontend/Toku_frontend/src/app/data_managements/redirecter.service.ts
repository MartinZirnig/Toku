import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Cache } from './cache';

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
 
 public LastGroup(){
    this.router.navigate(['main'], { fragment: Cache.peek('room') });
 }
 public Group(groupId: number) {
    const room = String(groupId);
    Cache.put('room', room);

    this.router.navigate(['main'], { fragment: room});
  }
  public Chat(chatId: number) {
    this.router.navigate(['main'], { fragment: String(chatId) });
  }

  public GroupSettings(groupId: number) {
    const group = String(groupId);

    this.router.navigate(['group-settings'], { fragment: group });
  }
  public AddGroup() {
    this.router.navigate(['group-settings'], { fragment: 'new' });
  }

  public GetUrl() {
    return this.router.url;
  }
  public SetFragment(value: string) {
    this.router.navigate([], { fragment: value });
  } 
}
