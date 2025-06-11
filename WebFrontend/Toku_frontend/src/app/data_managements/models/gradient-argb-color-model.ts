export class GradientArgbColorModel {
constructor(
        //color 1 - 0%
        public a1: number,
        public r1: number,
        public g1: number,
        public b1: number,

        //color 2 - 20%
        public a2: number,
        public r2: number,
        public g2: number,
        public b2: number,

        //color 3 - 40%
        public a3: number,
        public r3: number,
        public g3: number,
        public b3: number,

        //color 4 - 60%
        public a4: number,
        public r4: number,
        public g4: number,
        public b4: number,

        //color 5 - 80%
        public a5: number,
        public r5: number,
        public g5: number,
        public b5: number,

        //color 6 - 100%
        public a6: number,
        public r6: number,
        public g6: number,
        public b6: number
    ) {}

    static fromObject(data: Partial<GradientArgbColorModel>): GradientArgbColorModel {
        return Object.assign(
            new GradientArgbColorModel(
                data.a1 ?? 0, data.r1 ?? 0, data.g1 ?? 0, data.b1 ?? 0,
                data.a2 ?? 0, data.r2 ?? 0, data.g2 ?? 0, data.b2 ?? 0,
                data.a3 ?? 0, data.r3 ?? 0, data.g3 ?? 0, data.b3 ?? 0,
                data.a4 ?? 0, data.r4 ?? 0, data.g4 ?? 0, data.b4 ?? 0,
                data.a5 ?? 0, data.r5 ?? 0, data.g5 ?? 0, data.b5 ?? 0,
                data.a6 ?? 0, data.r6 ?? 0, data.g6 ?? 0, data.b6 ?? 0
            ), data
        );
    }

    toLinearGradientString(degree: number): string {
        const stops = [
            { a: this.a1, r: this.r1, g: this.g1, b: this.b1, p: '0%' },
            { a: this.a2, r: this.r2, g: this.g2, b: this.b2, p: '20%' },
            { a: this.a3, r: this.r3, g: this.g3, b: this.b3, p: '40%' },
            { a: this.a4, r: this.r4, g: this.g4, b: this.b4, p: '60%' },
            { a: this.a5, r: this.r5, g: this.g5, b: this.b5, p: '80%' },
            { a: this.a6, r: this.r6, g: this.g6, b: this.b6, p: '100%' }
        ];
        const toRgba = (c: {a:number,r:number,g:number,b:number}) =>
            `rgba(${c.r},${c.g},${c.b},${(c.a / 255).toFixed(3)})`;
        return `linear-gradient(${degree}deg, ${stops.map(s => `${toRgba(s)} ${s.p}`).join(', ')})`;
    }
}
