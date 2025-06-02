import { Injectable } from '@angular/core';
import { ArgbColorModel, ColorSettingsModel } from '../../../../../../../ColorsModel';

@Injectable({
  providedIn: 'root'
})
export class ColorManagerService {
  declare private csm: ColorSettingsModel;
    constructor() 
    { 
        // fetch, naplní 

        if (this.csm === null)
            this.csm = this.GetDefault();
    }
    private GetDefault() : ColorSettingsModel
    {
        return new ColorSettingsModel(
            new ArgbColorModel(1,1,1,1),
            new ArgbColorModel(1,1,1,1)
        );
    }
}
