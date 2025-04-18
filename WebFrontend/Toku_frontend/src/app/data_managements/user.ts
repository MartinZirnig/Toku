export const User = {
    UIdCode: 'uid',
    get Id() : string | null {
        const value = sessionStorage.getItem(this.UIdCode)
        return value;
    },
    set Id(value: string) {
        sessionStorage.setItem(this.UIdCode, value);
    },
    ClearId() : void {
        sessionStorage.removeItem(this.UIdCode)
    }
}
