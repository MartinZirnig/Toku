export class AvailableGroupsModel {
    constructor(
      public groupId: number,
      public groupName: string,
      public lastDecryptedMessage: string,
      public picturePath: string,
      public lastOperation: string
    ) {}
  }