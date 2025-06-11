export class ArgbColorModel
{
    constructor(
        public r: number,
        public g: number,
        public b: number,
        public a: number
    ) {}

    static fromObject(data: Partial<ArgbColorModel>): ArgbColorModel {
        return Object.assign(
            new ArgbColorModel(
                data?.r ?? 0, data?.g ?? 0,
                data?.b ?? 0, data?.a ?? 0
            ), data
        );
    }

    toRgbaString(): string {
        return `rgba(${this.r},${this.g},${this.b},${(this.a / 255).toFixed(3)})`;
    }
}