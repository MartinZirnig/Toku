export class GroupUpdateModel {
    constructor(
      public name: string,
      public description: string,
      public groupType: number,
      public password: string,
      public groupId: number   
    ) {}
  }