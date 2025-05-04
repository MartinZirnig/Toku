export class GroupUserAccessModel {
    constructor(
      public userId: number,
      public groupId: number,
      public permissions: number[],
      public name?: string
    ) {}
  }
  