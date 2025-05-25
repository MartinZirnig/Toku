export class GroupRemoveUserModel {
    constructor(
        public executorContext: string,
        public targetUser: number,
        public targetGroup: number
    ) { }
}
