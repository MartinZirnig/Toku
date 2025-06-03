import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  declare private map: Map<string, string>;

  constructor() 
  {
    this.map = new Map();

        const cookies = document.cookie.split(';');
        cookies.forEach(cook => {
          const value = cook.split('=');
          if (cook.length === 2) 
            this.map.set(value[0], value[1]);
        });
  } 

  public Set(name: string, value: string) : void {
    this.map.set(name, value);
  }
  public Get(name: string) : string {
    return this.map.get(name) ?? '';
  }
  public Save() : void {
    let result : string = '';
    this.map.forEach((key, value) => {
      result += `${key}=${value};`
    });
    result = result.slice(0, result.length - 1);
  } 
}
