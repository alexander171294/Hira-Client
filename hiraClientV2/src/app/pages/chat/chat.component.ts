import { Subscription } from 'rxjs';
import { Time } from './../../IRCore/utils/Time.util';
import { IndividualMessage, IndividualMessageTypes } from './../../IRCore/dto/IndividualMessage';
import { IRCoreService } from 'src/app/IRCore/IRCore.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelData } from 'src/app/IRCore/services/ChannelData';
import { ChannelsService } from 'src/app/IRCore/services/channels.service';
import { MessageHandler } from 'src/app/IRCore/handlers/Message.handler';
import { UserInfoService } from 'src/app/IRCore/services/user-info.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  image: string = undefined;
  members: number = 15;
  public message: string;

  private channelName: string;
  public channel: ChannelData;
  private routeSubscription: Subscription;

  constructor(router: Router, route: ActivatedRoute, private chanSrv: ChannelsService, private ircSrv: IRCoreService, private uInfoSrv: UserInfoService) {
    this.routeSubscription = router.events.subscribe(d => {
      this.channelName = route.snapshot.params.channel;
      this.ngOnInit();
    });
  }

  ngOnInit(): void {
    if(this.channelName) {
      this.channel = this.chanSrv.getChannel(this.channelName);
      this.members = this.channel.users.length;
    }
    document.getElementById('messageInput').focus();
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
