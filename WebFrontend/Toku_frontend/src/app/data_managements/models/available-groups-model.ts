export class AvailableGroupsModel {
  declare public picture?: string;
    constructor(
      public groupId: number,
      public groupName: string,
      public lastDecryptedMessage: string,
      public picturePath: string,
      public lastOperation: string,
    ) {}
  }