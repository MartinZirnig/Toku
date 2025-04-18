export class StoredMessageModel {
  constructor(
    public messageContent: string,
    public groupId: number,
    public status: number,
    public attachedFileId?: number | null,
    public pinnedMessageId?: number | null,
  ) {}
}