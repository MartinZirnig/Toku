export class UserRegistrationModel {
    constructor(
      public name: string,
      public email: string,
      public password: string,
      public timeZone: number
    ) {}
  }