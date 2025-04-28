import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupReloadService {
  declare public groupReload: () => void;
  constructor( ) { }
}
