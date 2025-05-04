export class GroupAddUserModel {
    constructor(
      public userId: number,
      public groupId: number,
      public permission: number
    ) {}
  }
  