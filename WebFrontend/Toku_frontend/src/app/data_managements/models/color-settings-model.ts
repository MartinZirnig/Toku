import { ArgbColorModel } from "./argb-color-model";

export class ColorSettingsModel 
{
    constructor(
        public input: ArgbColorModel,
        public button: ArgbColorModel
    ) {}
}