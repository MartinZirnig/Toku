export class UserDataModel {
    constructor(
        public name: string,
        public email: string,
        public phoneNumber: string,
        public active: string,
        public domainName?: string,
        public hasControl?: boolean,
        public picture?: string,
    ) { }
}
