export class FileModel {
    constructor(
      public data: Uint8Array,
      public fileName: string,
      public fileType: number,
      public userOwner?: string | null,
      public clientOwner?: number | null,
      public groupOwner?: number | null
    ) {}
  }
  