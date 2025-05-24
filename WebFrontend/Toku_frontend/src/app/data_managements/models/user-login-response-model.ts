export class UserLoginResponseModel {
    public constructor(
        public userIdentification : string,
        public lastGroupId: number, 
        public userId: number
    ) {}
}
