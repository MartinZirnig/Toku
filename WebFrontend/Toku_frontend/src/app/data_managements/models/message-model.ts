export class MessageModel {
    constructor(
      public messageContent: string,
      public senderContext: string, 
      public groupId: number,
      public attachedFilesId?: number[] | null,
      public pinnedMessageId?: number | null
    ) {}
  }