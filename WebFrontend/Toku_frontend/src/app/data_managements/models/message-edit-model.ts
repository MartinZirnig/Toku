export class MessageEditModel {
    constructor(
        public editorContext: string,
        public messageId: number,
        public newContent: string
    ) {}
}
