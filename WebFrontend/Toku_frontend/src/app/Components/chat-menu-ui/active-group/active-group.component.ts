import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActiveGroupMenuService} from '../../../services/active-group-menu-service.service';
import { AvailableGroupsModel } from '../../../data_managements/models/available-groups-model';
import { GroupsLoaderService } from '../../../data_managements/control-services/groups-loader.service';
import { Redirecter } from '../../../data_managements/redirecter.service';

@Component({
  selector: 'app-active-group',
  imports: [CommonModule, NgIf], 
  templateUrl: './active-group.component.html',
  styleUrl: './active-group.component.scss'
})
export class ActiveGroupComponent {
  declare public name: string;
  declare public lastMessage: string;
  declare public time: string;
  
  @Input() data: any;
  ngOnChanges() {
    if (this.data) {
      this.load(this.data);
    }
  }

  constructor(
    public service: ActiveGroupMenuService,
    private loader: GroupsLoaderService,
    private redirecter: Redirecter
  ) { }

  public load(model: AvailableGroupsModel) : void {
    this.name = model.groupName;
    this.lastMessage = model.lastDecryptedMessage;
    this.time = model.lastOperation;
  }

  public onClick() {
    const request = this.loader.updateLastGroup(this.data.groupId)
    request.subscribe({
      next: response => {
        if (response.success)
          this.redirecter.Group(this.data.groupId);
        else
          console.log('failed setting last group: ' + response.description);
      },
      error: err => {
        console.error('error in setting last group: ', err);
      }
    })
  }

  editClicked() {
    this.redirecter.GroupSettings(this.data.groupId);
  }
}
