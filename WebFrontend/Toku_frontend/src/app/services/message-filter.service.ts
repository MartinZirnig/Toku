import { Injectable, numberAttribute } from '@angular/core';
import { User } from '../data_managements/user';
import { CookieService } from '../data_managements/services/cookie.service';

@Injectable({
  providedIn: 'root'
})
export class MessageFilterService {
  declare private cache: number[];
  
  constructor(
    private cookService: CookieService
  ) { }
  Load () : void {
    const expected = `UFM_${User.OriginalId}`
    const value = this.cookService.Get(expected);

    this.cache = value
      .split(',')
      .map(msg => Number(msg));
  }

  IsNotFiltered(id : number) : boolean {
    return !this.cache.includes(id);
  }

  HideMessage(messageId: number) : void {

  }
}
