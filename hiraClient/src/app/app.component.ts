import { Component, OnInit, ViewChild } from '@angular/core';
import { IRCProtocolService } from './services/ircprotocol.service';
import { ServerData } from './services/ServerData';
import { MessagePoolService, ChatsDelta, DeltaChangeTypes, ServersDelta, UserDelta } from './services/message-pool.service';
import { ProcessedMessage, IRCMessage, IRCMessageDTO, UserJoiningDTO, UserLeavingDTO, MessageTypes } from './services/IRCParser';
import { CBoxChatTypes, ChatBoxComponent } from './components/chat-box/chat-box.component';
import { ChatData, NotificationsChats } from './components/chat-list/chat-list.component';
import { UserWithMetadata } from './services/RichLayer';
import { ActivatedRoute } from '@angular/router';
import { ParamParse } from './services/ParamParse';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  connectPopup = true;

  privateChats: string[];
  chatsRooms: string[];
  channelUsers: UserWithMetadata[];
  messages: ProcessedMessage<IRCMessage | IRCMessageDTO | UserJoiningDTO | UserLeavingDTO>[];

  isInServerLog = true;
  chatName = 'Server';
  chatType = CBoxChatTypes.SERVER;
  chatTopic = 'Mensajes del servidor.';
  chatMembers: number;

  notifications: NotificationsChats = new NotificationsChats();

  @ViewChild('cbox') cbox: ChatBoxComponent;

  actualServerID: string;
  embd: boolean;

  constructor(private ircproto: IRCProtocolService,
              private msgPool: MessagePoolService) { }

  ngOnInit(): void {
    ParamParse.parseHash(window.location.hash.slice(1));
    this.embd = ParamParse.parametria.embedded ? true : false;
    this.msgPool.noticed.subscribe((serverID) => {
      this.ircproto.autoJoin(serverID);
    });
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
        this.notifications.server = true;
      }
    });
    this.msgPool.chatsChanged.subscribe((chatsDelta: ChatsDelta) => {
      console.log('Chat Delta', chatsDelta);
      if (chatsDelta.changeType === DeltaChangeTypes.ADDED) {
        if (chatsDelta.isPrivate) {
          this.privateChats = this.msgPool.getPrivateChats(chatsDelta.serverID);
          this.cbox.goBottom();
        } else {
          this.chatsRooms = this.msgPool.getChannels(chatsDelta.serverID);
          this.cbox.goBottom();
        }
      }
      if (chatsDelta.changeType === DeltaChangeTypes.DELETED) {
        this.chatsRooms = this.msgPool.getChannels(chatsDelta.serverID);
      }
      // new message
      if (chatsDelta.changeType === DeltaChangeTypes.UPDATED) {
        const privateChatOpened = this.chatType === CBoxChatTypes.PRIVMSG;
        const deltaPrivate = chatsDelta.message.messageType === MessageTypes.PRIV_MSG;
        if (chatsDelta.chat[0] === '#') {
          chatsDelta.chat = chatsDelta.chat.slice(1);
        }
        if (!this.isInServerLog && this.chatName === chatsDelta.chat && privateChatOpened === deltaPrivate) {
          if (privateChatOpened) {
            this.messages = this.msgPool.getPrivateMessages(chatsDelta.serverID, this.chatName);
          } else {
            this.messages = this.msgPool.getChannelMessages(chatsDelta.serverID, this.chatName);
          }
          this.cbox.goBottom();
        } else {
          if (deltaPrivate) {
            this.notifications.privates[chatsDelta.chat] = chatsDelta.message.data.mention ? 'mentioned' : 'normal';
          } else {
            this.notifications.channels[chatsDelta.chat] = chatsDelta.message.data.mention ? 'mentioned' : 'normal';
          }
        }
      }
    });
  }

  changeChat(cd: ChatData) {
    this.chatName = cd.chatName;
    this.chatType = cd.privateChat ? CBoxChatTypes.PRIVMSG : CBoxChatTypes.CHANNEL;
    this.isInServerLog = false;
    if (cd.privateChat) {
      this.messages = this.msgPool.getPrivateMessages(this.actualServerID, this.chatName);
      this.chatTopic = '';
    } else {
      this.messages = this.msgPool.getChannelMessages(this.actualServerID, this.chatName);
      this.chatTopic = this.msgPool.getChannelTopic(this.actualServerID, this.chatName);
    }
    this.cbox.goBottom();
    this.channelUsers = this.msgPool.getChannelUsers(this.actualServerID, this.chatName);
  }

  selectServer() {
    this.chatName = 'Server';
    this.chatTopic = 'Mensajes del servidor.';
    this.chatType = CBoxChatTypes.SERVER;
    this.isInServerLog = true;
    this.messages = this.msgPool.getServerMessages(this.actualServerID);
    this.cbox.goBottom();
    this.channelUsers = [];
  }

  connect(serverData: ServerData) {
    this.actualServerID = serverData.id;
    this.ircproto.connect(serverData);
    this.connectPopup = false;
  }

  send(command: string) {
    if (!this.isInServerLog) {
      let target;
      target = this.chatName;
      if (this.chatType === CBoxChatTypes.CHANNEL) {
        target = '#' + target;
      }
      this.ircproto.sendMessageOrCommand(this.actualServerID, command, target);
    } else {
      this.ircproto.sendMessageOrCommand(this.actualServerID, command);
    }
  }

  openPrivateChat(user: string) {
    this.msgPool.addPrivateMessage(this.actualServerID, user);
    this.changeChat(new ChatData(true, user));
  }
}
