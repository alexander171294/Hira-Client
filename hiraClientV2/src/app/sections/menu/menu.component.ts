import { ChannelData } from './../../IRCore/services/ChannelData';
import { Component, OnInit } from '@angular/core';
import { ChannelsService } from 'src/app/IRCore/services/channels.service';
import { ListElement } from '../list/list.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  public channels: ListElement[];
  public activeChannel: string = undefined;

  public privMsg: ListElement[];

  /**
   * [
    {name:'Alex', image: 'https://thira.tandilserver.com/avatar?usr=Alex'},
    {name:'Zaratuxtra', image: 'https://thira.tandilserver.com/avatar?usr=Zaratuxtra'},
    {name:'Gabriela-', notify: true, image: 'https://thira.tandilserver.com/avatar?usr=Gabriela-'},
    {name:'Mendax', image: 'https://thira.tandilserver.com/avatar?usr=Mendax'}
  ]
   */

  constructor(private cSrv: ChannelsService) { }

  ngOnInit(): void {
    this.cSrv.listChanged.subscribe((d: ChannelData[]) => {
      // validamos la lista
      this.channels = [];
      d.forEach(channel => {
        const elem = new ListElement();
        elem.active = this.activeChannel == channel.name;
        elem.name = channel.name[0] == '#' ? channel.name.substring(1) : channel.name;
        this.channels.push(elem);
      })
    });
  }

}
