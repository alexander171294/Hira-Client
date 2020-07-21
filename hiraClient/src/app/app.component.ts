import { Component, OnInit, ViewChild } from '@angular/core';
import { IRCProtocolService } from './services/ircprotocol.service';
import { ServerData } from './services/ServerData';
import { MessagePoolService, ChatsDelta, DeltaChangeTypes, ServersDelta } from './services/message-pool.service';
import { ProcessedMessage, IRCMessage, IRCMessageDTO } from './services/IRCParser';
import { CBoxChatTypes, ChatBoxComponent } from './components/chat-box/chat-box.component';

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
  chatName = 'Server';
  chatType = CBoxChatTypes.SERVER;
  chatTopic: string;
  chatMembers: number;

  @ViewChild('cbox') cbox: ChatBoxComponent;

  constructor(private ircproto: IRCProtocolService,
              private msgPool: MessagePoolService) { }

  ngOnInit(): void {
    this.msgPool.usersChanged.subscribe(usersDelta => {

    });
    this.msgPool.serverChanged.subscribe((serverDelta: ServersDelta) => {
      if (this.isInServerLog) {
        this.messages = this.msgPool.getServerMessages(serverDelta.serverID);
        this.cbox.goBottom();
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
