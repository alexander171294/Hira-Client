import { IndividualMessage } from './../../IRCore/dto/IndividualMessage';
import { IRCoreService } from 'src/app/IRCore/IRCore.service';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChannelData } from 'src/app/IRCore/services/ChannelData';
import { ChannelsService } from 'src/app/IRCore/services/channels.service';
import { MessageHandler } from 'src/app/IRCore/handlers/Message.handler';
import { UserInfoService } from 'src/app/IRCore/services/user-info.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  image: string = undefined;
  members: number = 15;
  public message: string;

  private channelName: string;
  public channel: ChannelData;

  constructor(route: ActivatedRoute, private chanSrv: ChannelsService, private ircSrv: IRCoreService, private uInfoSrv: UserInfoService) {
    this.channelName = route.snapshot.params.channel;
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
    const iMessage = new IndividualMessage();
    iMessage.author = this.uInfoSrv.getNick();
    iMessage.message = this.message;
    iMessage.meAction = false;
    iMessage.date = 'ymd';
    iMessage.time = 'now';
    MessageHandler.onMessage(iMessage);
    this.message = '';
    document.getElementById('messageInput').focus();
  }

}
