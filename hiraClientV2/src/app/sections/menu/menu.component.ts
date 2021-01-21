import { MenuElement, MenuSelectorEvent, MenuType } from './menu-selector.event';
import { Subscription } from 'rxjs';
import { UserInfoService } from './../../IRCore/services/user-info.service';
import { ChannelData } from './../../IRCore/services/ChannelData';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChannelsService } from 'src/app/IRCore/services/channels.service';
import { ListElement } from '../list/list.component';
import { JoinHandler } from 'src/app/IRCore/handlers/Join.handler';
import { Join } from 'src/app/IRCore/dto/Join';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

  public channels: ListElement[];
  public activeChannel: string = undefined;

  public privMsg: ListElement[];

  private joinSubscription: Subscription;

  public lastSelected: MenuElement;

  /**
   * [
    {name:'Alex', image: 'https://thira.tandilserver.com/avatar?usr=Alex'},
    {name:'Zaratuxtra', image: 'https://thira.tandilserver.com/avatar?usr=Zaratuxtra'},
    {name:'Gabriela-', notify: true, image: 'https://thira.tandilserver.com/avatar?usr=Gabriela-'},
    {name:'Mendax', image: 'https://thira.tandilserver.com/avatar?usr=Mendax'}
  ]
   */

  constructor(private cSrv: ChannelsService, private userSrv: UserInfoService, private router: Router) {
    this.joinSubscription = JoinHandler.joinResponse.subscribe((data: Join) => {
      if (data.user.nick === this.userSrv.getNick()) {
        this.router.navigateByUrl('/chat/' + data.channel.name);
      }
    });
    MenuSelectorEvent.menuChange.subscribe(d => {
      if(this.lastSelected?.type === MenuType.CHANNEL) {
        this.channels.find(channel => channel.name == this.lastSelected.name).active = false;
      } else if(this.lastSelected?.type === MenuType.PRIV_MSG) {
        this.privMsg.find(channel => channel.name == this.lastSelected.name).active = false;
      }
      this.lastSelected = d;
      if(this.lastSelected?.type === MenuType.CHANNEL) {
        this.channels.find(channel => channel.name == this.lastSelected.name).active = true;
      } else if(this.lastSelected?.type === MenuType.PRIV_MSG) {
        this.privMsg.find(channel => channel.name == this.lastSelected.name).active = true;
      }
    })
  }

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

  ngOnDestroy() {
    this.joinSubscription.unsubscribe();
  }

}
