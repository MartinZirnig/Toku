export class MessageModel {
    constructor(
      public messageContent: string,
      public senderContext: string, 
      public groupId: number,
      public attachedFileId?: number | null,
      public pinnedMessageId?: number | null
    ) {}
  }