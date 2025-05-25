import { UserDataModel } from "./models/user-data-model";

export const User = {
    UIdCode: 'uid',
    get Id() : string | null {
        const value = sessionStorage.getItem(this.UIdCode)
        return value;
    },
    set Id(value: string) {
        sessionStorage.setItem(this.UIdCode, value);
    },
    ClearId() : void {
        sessionStorage.removeItem(this.UIdCode)
    },

    get OriginalId() : string | null {
        const value = sessionStorage.getItem('originalId')
        return value;
    },
    set OriginalId(value: string) {
        sessionStorage.setItem('originalId', value);
    },
    ClearOriginalId() : void {
        sessionStorage.removeItem('originalId')
    },

    get Name() : string {
        return sessionStorage.getItem('name') ?? 'inkognito';
    },
    get Email() : string {
        return sessionStorage.getItem('email') ?? 'inkognito';
    },
    get Phone() : string {
        return sessionStorage.getItem('phone') ?? 'inkognito';
    },
    get Active() : string {
        return sessionStorage.getItem('active') ?? 'inkognito';
    },
    set Data(value: UserDataModel) {
        sessionStorage.setItem('name', value.name);
        sessionStorage.setItem('email', value.email);
        sessionStorage.setItem('phone', value.phoneNumber);
        sessionStorage.setItem('active', value.active);
    },
    ClearData() : void {
        sessionStorage.removeItem('name');
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('phone');
        sessionStorage.removeItem('active');
    },

    set Groups(value: string[]) { 
        const groups = value.join(',').slice(0, -1);
        sessionStorage.setItem('groups', groups); 
    },
    get Groups() : string[] {
        const groups = sessionStorage.getItem('groups') ?? 'undefined';
        return groups.split(',');
    },
    IsUserInGroup(group: string) : boolean {
        const groups = this.Groups;
        return groups.includes(group);
    },
    ClearGroups() : void {
        sessionStorage.removeItem('groups');
    },

    get InnerId() : string {
        return sessionStorage.getItem("innerId") ?? "";
    },
    set InnerId(value: string) {
        sessionStorage.setItem("innerId", value);
    },
    clearInnerId() : void {
        sessionStorage.removeItem("innerId");
    },

    get ActiveGroupId() : string {
        return sessionStorage.getItem("activeGroupId") ?? "";
    },
    set ActiveGroupId(value: string) {
        sessionStorage.setItem("activeGroupId", value);
    },
    clearActiveGroupId() : void {
        sessionStorage.removeItem("activeGroupId");
    }
}
