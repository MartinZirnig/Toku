export class GroupCreationModel {
    constructor(
      public creator: string,
      public name: string,
      public description: string,
      public groupType: number,
      public password: string
    ) {}
  }
  