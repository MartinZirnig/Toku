export class ArgbColorModel
{
    constructor(
        public r: number,
        public g: number,
        public b: number,
        public a: number
    ) {}

    toRgbaString(): string {
        return `rgba(${this.r},${this.g},${this.b},${(this.a / 255).toFixed(3)})`;
    }
}