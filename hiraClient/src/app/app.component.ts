import { Component, OnInit, ViewChild } from '@angular/core';
import { IRCProtocolService } from './services/ircprotocol.service';
import { ServerData } from './services/ServerData';
import { MessagePoolService, ChatsDelta, DeltaChangeTypes, ServersDelta, UserDelta } from './services/message-pool.service';
import { ProcessedMessage, IRCMessage, IRCMessageDTO, UserJoiningDTO, UserLeavingDTO } from './services/IRCParser';
import { CBoxChatTypes, ChatBoxComponent } from './components/chat-box/chat-box.component';
import { ChatData } from './components/chat-list/chat-list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  connectPopup = true;

  privateChats: string[];
  chatsRooms: string[];
  messages: ProcessedMessage<IRCMessage | IRCMessageDTO | UserJoiningDTO | UserLeavingDTO>[];

  isInServerLog = true;
  inServerNotifications = false;
  chatName = 'Server';
  chatType = CBoxChatTypes.SERVER;
  chatTopic: string;
  chatMembers: number;

  @ViewChild('cbox') cbox: ChatBoxComponent;

  actualServerID: string;

  constructor(private ircproto: IRCProtocolService,
              private msgPool: MessagePoolService) { }

  ngOnInit(): void {
    this.msgPool.usersChanged.subscribe((usersDelta: UserDelta) => {
      console.log('Users Delta', usersDelta);
      // if (usersDelta.changeType === DeltaChangeTypes.ADDED) {

      // }
    });
    this.msgPool.serverChanged.subscribe((serverDelta: ServersDelta) => {
      console.log('Server Delta', serverDelta);
      if (this.isInServerLog) {
        this.messages = this.msgPool.getServerMessages(serverDelta.serverID);
        this.cbox.goBottom();
      } else {
        this.inServerNotifications = true;
      }
    });
    this.msgPool.chatsChanged.subscribe((chatsDelta: ChatsDelta) => {
      console.log('Chat Delta', chatsDelta);
      if (chatsDelta.changeType === DeltaChangeTypes.ADDED) {
        if (chatsDelta.isPrivate) {
          this.privateChats = this.msgPool.getPrivateChats(chatsDelta.serverID);
        } else {
          this.chatsRooms = this.msgPool.getChannels(chatsDelta.serverID);
        }
      }
      if (chatsDelta.changeType === DeltaChangeTypes.DELETED) {
        this.chatsRooms = this.msgPool.getChannels(chatsDelta.serverID);
      }
      // new message
      if (chatsDelta.changeType === DeltaChangeTypes.UPDATED) {
        const privateChatOpened = this.chatType === CBoxChatTypes.PRIVMSG;
        if (!this.isInServerLog && this.chatName === chatsDelta.chat && privateChatOpened === chatsDelta.isPrivate) {
          this.messages = this.msgPool.getChannelMessages(chatsDelta.serverID, this.chatName);
        }
      }
    });
  }

  changeChat(cd: ChatData) {
    this.chatName = cd.chatName;
    this.chatType = cd.privateChat ? CBoxChatTypes.PRIVMSG : CBoxChatTypes.CHANNEL;
    this.isInServerLog = false;
    this.messages = this.msgPool.getChannelMessages(this.actualServerID, this.chatName);
  }

  connect(serverData: ServerData) {
    this.actualServerID = serverData.id;
    this.ircproto.connect(serverData);
    this.connectPopup = false;
  }

  send(command: string) {
    this.ircproto.sendMessageOrCommand(this.actualServerID, command);
  }
}
