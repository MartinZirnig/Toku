export class ArgbColorModel
{
    constructor(
        public a: number,
        public r: number,
        public g: number,
        public b: number
    ) {}

    toRgbaString(): string {
        return `rgba(${this.r},${this.g},${this.b},${(this.a / 255).toFixed(3)})`;
    }
}