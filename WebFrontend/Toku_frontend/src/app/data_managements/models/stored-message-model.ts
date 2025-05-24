export class StoredMessageModel {
  constructor(
    public messageId: number,
    public messageContent: string,
    public groupId: number,
    public status: number,
    public time: string,
    public pinnedMessagePrewiev?: string,
    public timeStamp?: string,
    public attachedFilesId?: number[],
    public pinnedMessageId?: number,
  ) {}

  public static getStatus(status: number): 'undelivered' | 'delivered' | 'read'{
    if (status === 0) return "undelivered"
    if (status === 1) return "delivered"
    if (status === 2) return "read";
    return 'undelivered';
  }
  public static isSender(staus: number) : boolean {
    return staus !== 255;
  }
}