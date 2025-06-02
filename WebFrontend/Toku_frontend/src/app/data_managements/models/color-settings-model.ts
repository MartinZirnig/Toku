import { ArgbColorModel } from "./argb-color-model";

export class ColorSettingsModel 
{
    constructor(
        public front: ArgbColorModel,
        public button: ArgbColorModel
    ) {}
}