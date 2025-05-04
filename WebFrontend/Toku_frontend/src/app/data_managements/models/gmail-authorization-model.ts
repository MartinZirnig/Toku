export class GmailAuthorizationModel {
    public constructor(
        public credentials: string,
        public selected_by: string,
        public timeZone: number
    ) {}
}
