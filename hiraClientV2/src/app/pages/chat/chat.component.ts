import { InfoPanelComponent } from './info-panel/info-panel.component';
import { Subscription } from 'rxjs';
import { IRCoreService } from 'src/app/IRCore/IRCore.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelData } from 'src/app/IRCore/services/ChannelData';
import { ChannelsService } from 'src/app/IRCore/services/channels.service';
import { UserInfoService } from 'src/app/IRCore/services/user-info.service';
import { MenuSelectorEvent, MenuType } from 'src/app/sections/menu/menu-selector.event';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  image: string = undefined;
  public message: string;

  private channelName: string;
  public channel: ChannelData = new ChannelData();
  private routeSubscription: Subscription;

  @ViewChild('infoPanel', {static: true}) appInfoPanel: InfoPanelComponent;

  constructor(private router: Router, route: ActivatedRoute, private chanSrv: ChannelsService, private ircSrv: IRCoreService, private uInfoSrv: UserInfoService) {
    this.routeSubscription = this.router.events.subscribe(d => {
      this.channelName = route.snapshot.params.channel;
      this.ngOnInit();
    });
  }

  ngOnInit(): void {
    if(this.channelName) {
      this.channel = this.chanSrv.getChannel(this.channelName);
      MenuSelectorEvent.menuChange.emit({
        type: MenuType.CHANNEL,
        name: this.channelName
      });
    } else if(this.chanSrv.getChannels().length > 0) {
      this.router.navigateByUrl('/chat/' + this.chanSrv.getChannels()[0].name);
    } else {
      this.ircSrv.join('main');
    }
    document.getElementById('messageInput').focus();
    this.appInfoPanel.recalcUsers(this.channel.users);
  }

  kp(event) {
    if(event.keyCode === 13) {
      this.send();
    }
  }

  send() {
    this.ircSrv.sendMessageOrCommand(this.message, '#'+this.channelName);
    this.message = '';
    document.getElementById('messageInput').focus();
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }
}
