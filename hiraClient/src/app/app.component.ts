import { Component, OnInit } from '@angular/core';
import { IRCProtocolService } from './services/ircprotocol.service';
import { ServerData } from './services/ServerData';
import { MessagePoolService, ChatsDelta, DeltaChangeTypes, ServersDelta } from './services/message-pool.service';
import { ProcessedMessage, IRCMessage, IRCMessageDTO } from './services/IRCParser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  connectPopup = true;

  privateChats: string[];
  chatsRooms: string[];
  messages: ProcessedMessage<IRCMessage | IRCMessageDTO>[];

  isInServerLog = true;
  inServerNotifications = false;

  constructor(private ircproto: IRCProtocolService,
              private msgPool: MessagePoolService) { }

  ngOnInit(): void {
    this.msgPool.usersChanged.subscribe(usersDelta => {

    });
    this.msgPool.serverChanged.subscribe((serverDelta: ServersDelta) => {
      if (this.isInServerLog) {
        this.messages = this.msgPool.getServerMessages(serverDelta.serverID);
      } else {
        this.inServerNotifications = true;
      }
    });
    this.msgPool.chatsChanged.subscribe((chatsDelta: ChatsDelta) => {
      if (chatsDelta.changeType === DeltaChangeTypes.ADDED) {
        if (chatsDelta.isPrivate) {
          this.privateChats = this.msgPool.getPrivateChats(chatsDelta.serverID);
        } else {
          this.chatsRooms = this.msgPool.getChannels(chatsDelta.serverID);
        }
      }
    });
  }


  connect(serverData: ServerData) {
    this.ircproto.connect(serverData);
    this.connectPopup = false;
  }
}
