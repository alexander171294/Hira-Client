import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/IRCore/dto/User';
import { UModes } from 'src/app/IRCore/utils/UModes.utils';
import { ListElement } from 'src/app/sections/list/list.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.scss']
})
export class InfoPanelComponent implements OnInit {

  @Input() members: ListElement[] = [];

  constructor() { }

  ngOnInit(): void { }

  public recalcUsers(users: User[]) {
    this.members = [];
    users.forEach(user => {
      const member = new ListElement();
      member.name = user.nick;
      member.labels = [];
      member.image = environment.hiranaTools + '/avatar?usr=' + user.nick;
      if(user.mode == UModes.FOUNDER) {
        member.labels.push(
          {
            name: 'Founder',
            background: '#4b3526',
            color: '#dea777'
          }
        );
        member.color = '#009bd8';
      }
      if(user.mode == UModes.ADMIN) {
        member.labels.push(
          {
            name: 'Admin',
            background: '#3d264b',
            color: '#a977de'
          }
        );
        member.color = '#009bd8';
      }
      if(user.mode == UModes.OPER) {
        member.labels.push(
          {
            name: 'Oper',
            background: '#2c4b26',
            color: '#79d87d'
          }
        );
        member.color = '#009bd8';
      }
      if(user.mode == UModes.HALFOPER) {
        member.labels.push(
          {
            name: 'Half-oper',
            background: '#26344b',
            color: '#779fde'
          }
        );
        member.color = '#009bd8';
      }
      if(user.mode == UModes.VOICE) {
        member.color = '#009bd8';
      }
      this.members.push(member);
    });
  }

}
