import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { Server } from './server';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class Heart {
  private sub?: Subscription;
  private readonly beatRate: number = 60 * 1000;
  private readonly url: string 
    = Server.Url + "/heart/beat"

  public constructor(private http: HttpClient) {}

  public startBeat(): void {
    if (this.sub) {
      this.stopBeat();
    }

    this.sub = interval(this.beatRate).
      subscribe(() => {
      this.beat()
    });
  }

  public stopBeat(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
  }

  private beat(): void {
    this.http.post(this.url, null).subscribe({
      next: () => console.info('Heart beated.'),
      error: (err) => console.error('Error during heart beat:', err)
    });
  }
}
