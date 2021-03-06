import { Component, OnInit, ViewChild } from '@angular/core';
import { IRCProtocolService } from './services/ircprotocol.service';
import { ServerData } from './utils/ServerData';
import { MessagePoolService, ChatsDelta, DeltaChangeTypes, ServersDelta, UserDelta } from './services/message-pool.service';
import { ProcessedMessage, IRCMessage, IRCMessageDTO, UserJoiningDTO, UserLeavingDTO, MessageTypes, NickChangedDTO } from './utils/IRCParser';
import { CBoxChatTypes, ChatBoxComponent } from './components/chat-box/chat-box.component';
import { ChatData, NotificationsChats } from './components/chat-list/chat-list.component';
import { ParamParse } from './utils/ParamParse';
import { UserStatuses, UserWithMetadata } from './utils/PostProcessor';
import { MessageHandlerService } from './services/message-handler.service';
import { environment } from 'src/environments/environment';
import { ChannellistsService } from './services/channellists.service';

declare var electronApi: any;
declare var GLB_electronConfig: any;

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
  messages: ProcessedMessage<IRCMessage | IRCMessageDTO | UserJoiningDTO | UserLeavingDTO | NickChangedDTO | string>[];

  isInServerLog = true;
  chatName = 'Server';
  chatType = CBoxChatTypes.SERVER;
  chatTopic = 'Mensajes del servidor.';
  chatMembers: number;

  actualNick: string;

  notifications: NotificationsChats = new NotificationsChats();

  isConnected = false;
  connectionError = false;

  @ViewChild('cbox') cbox: ChatBoxComponent;

  actualServerID: string;
  actualServerName: string;
  embd: boolean;
  nuevoNick: boolean;

  /** POPUPS */
  advertenciaBanneado: boolean;
  canalKickeado: string;
  advertenciaKickeado: boolean;
  cambiarNickPopup: boolean;
  channelListPopup: boolean;
  electronCFG: boolean;
  whoDataOf: string;
  gmode: string;

  actualServerAutojoin: string;

  intervals = {};

  whoPuller = true;

  constructor(private ircproto: IRCProtocolService,
              private msgPool: MessagePoolService,
              private msgHdlr: MessageHandlerService,
              private chlLst: ChannellistsService) { }

  ngOnInit(): void {
    ParamParse.parseHash(window.location.hash.slice(1));
    this.embd = ParamParse.parametria.embedded ? true : false;
    if (environment.electron) {
      const script = document.createElement('script');
      script.setAttribute('src', 'assets/electron.js');
      document.body.append(script);
    }
    // console.log(ParamParse.parametria.skin);
    if (ParamParse.parametria.skin) {
      if (environment.skins[ParamParse.parametria.skin]) {
        document.body.classList.add(environment.skins[ParamParse.parametria.skin]);
      }
    } else if (localStorage.getItem('ThemeForzed')) {
      document.body.classList.add(environment.skins[localStorage.getItem('ThemeForzed')]);
    }
    this.msgPool.noticed.subscribe((serverID) => {
      this.ircproto.autoJoin(serverID);
    });
    this.msgPool.usersChanged.subscribe((usersDelta: UserDelta) => {
      // console.log('Users Delta', usersDelta);
      if (usersDelta.changeType === DeltaChangeTypes.FIXED_UPDATE) { // update our nick
        this.actualNick = usersDelta.user.nick;
      }
      if (usersDelta.changeType === DeltaChangeTypes.DELETED) {
        if (this.actualNick === usersDelta.user.nick) {
          // is the open chat
          const chnl = usersDelta.channel.slice(1);
          if (this.chatName === chnl && this.chatType === CBoxChatTypes.CHANNEL) {
            this.selectServer();
          }
          this.msgPool.removeChannel(usersDelta.serverID, chnl);
          this.chatsRooms = this.msgPool.getChannels(usersDelta.serverID);
        }
      }
      this.cbox.goBottom();
    });
    this.msgPool.serverChanged.subscribe((serverDelta: ServersDelta) => {
      // console.log('Server Delta', serverDelta);
      if (this.isInServerLog) {
        this.messages = this.msgPool.getServerMessages(serverDelta.serverID);
        this.cbox.goBottom();
      } else {
        this.notifications.server = true;
      }
    });
    this.msgPool.chatsChanged.subscribe((chatsDelta: ChatsDelta) => {
      // console.log('Chat Delta', chatsDelta);
      if (chatsDelta.changeType === DeltaChangeTypes.ADDED) {
        if (chatsDelta.isPrivate) {
          this.privateChats = this.msgPool.getPrivateChats(chatsDelta.serverID);
        } else {
          // Check for Away
          this.ircproto.sendMessageOrCommand(chatsDelta.serverID, '/WHO ' + chatsDelta.chat);
          this.intervals[chatsDelta.chat] = setInterval(() => {
            if ('#' + this.chatName === chatsDelta.chat && this.whoPuller) {
              this.ircproto.sendMessageOrCommand(chatsDelta.serverID, '/WHO ' + chatsDelta.chat);
            }
          }, environment.intervalWHO);
          this.chatsRooms = this.msgPool.getChannels(chatsDelta.serverID);
          setTimeout(() => {
            this.changeChat(new ChatData(false, chatsDelta.chat));
          }, 100);
        }
      }
      if (chatsDelta.changeType === DeltaChangeTypes.FORBIDDEN) {
        this.advertenciaBanneado = true;
      }
      if (chatsDelta.changeType === DeltaChangeTypes.EXITED) {
        this.advertenciaKickeado = true;
        this.canalKickeado = chatsDelta.chat;
      }
      if (chatsDelta.changeType === DeltaChangeTypes.DELETED) {
        clearInterval(this.intervals[chatsDelta.chat]);
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
            if (this.notifications.privates[chatsDelta.chat] !== 'mentioned') {
              this.notifications.privates[chatsDelta.chat] = chatsDelta.message.data.mention ? 'mentioned' : 'normal';
            }
            if (environment.electron) {
              // si es un privado:
              electronApi.news();
            }
          } else {
            if (this.notifications.channels[chatsDelta.chat] !== 'mentioned') {
              this.notifications.channels[chatsDelta.chat] = chatsDelta.message.data.mention ? 'mentioned' : 'normal';
            }
          }
        }

        if (environment.electron) {
          if (chatsDelta.message.data.mention) {
            // o es una mensión:
            electronApi.news();
          } else if (deltaPrivate) {
            electronApi.news();
          }
        }
      }

      if (chatsDelta.changeType === DeltaChangeTypes.FIXED_UPDATE) {
        // cambio algo del canal, por ejemplo el topic.
        this.chatTopic = this.msgPool.getChannelTopic(chatsDelta.serverID, chatsDelta.chat);
      }
    });
    this.msgHdlr.onError.subscribe(d => {
      this.isConnected = false;
      this.connectPopup = true;
      this.connectionError = true;
    });
    this.chlLst.onCleared.subscribe(() => {
      this.channelListPopup = true;
    });
    this.chlLst.whoisResponse.subscribe((d: string) => {
      this.whoDataOf = d;
    });
    this.chlLst.gmodeResponse.subscribe((d: string) => {
      this.gmode = d;
    });
  }

  changeChat(cd: ChatData) {
    this.chatName = cd.chatName[0] !== '#' ? cd.chatName : cd.chatName.slice(1);
    this.chatType = cd.privateChat ? CBoxChatTypes.PRIVMSG : CBoxChatTypes.CHANNEL;
    this.isInServerLog = false;
    if (cd.privateChat) {
      this.messages = this.msgPool.getPrivateMessages(this.actualServerID, this.chatName);
      this.chatTopic = '';
      this.channelUsers = [
        {
          nick: this.chatName,
          status: undefined
        },
        {
          nick: this.actualNick,
          status: undefined
        }
      ];
    } else {
      this.messages = this.msgPool.getChannelMessages(this.actualServerID, this.chatName);
      this.chatTopic = this.msgPool.getChannelTopic(this.actualServerID, this.chatName);
      this.channelUsers = this.msgPool.getChannelUsers(this.actualServerID, this.chatName);
    }
    this.cbox.goBottom(true);
  }

  selectServer() {
    this.chatName = this.actualServerName ? this.actualServerName : 'Server';
    this.chatTopic = 'Mensajes del servidor.';
    this.chatType = CBoxChatTypes.SERVER;
    this.isInServerLog = true;
    this.messages = this.msgPool.getServerMessages(this.actualServerID);
    this.cbox.goBottom(true);
    this.channelUsers = [];
  }

  connect(serverData: ServerData) {
    this.actualServerID = serverData.id;
    this.actualServerName = serverData.name;
    this.chatName = serverData.name;
    this.ircproto.connect(serverData);
    this.actualNick = serverData.apodo;
    this.connectPopup = false;
    this.isConnected = true;
    this.actualServerAutojoin = serverData.autojoin;
  }

  send(command: string) {
    if (command.indexOf('/query') === 0) {
      this.openPrivateChat(command.split(' ')[1]);
      return;
    }
    if (command === '/clear') {
      if (this.chatType === CBoxChatTypes.CHANNEL) {
        this.msgPool.clearChannel(this.actualServerID, this.chatName);
        this.messages = this.msgPool.getChannelMessages(this.actualServerID, this.chatName);
      } else if (this.chatType === CBoxChatTypes.PRIVMSG) {
        this.msgPool.clearPrivateChat(this.actualServerID, this.chatName);
        this.messages = this.msgPool.getPrivateMessages(this.actualServerID, this.chatName);
      }
      return;
    }
    if (command === '/nowhox') { // special command
      this.whoPuller = false;
      return;
    }
    if (command === '/sound off' && environment.electron) {
      GLB_electronConfig.sound = false;
      return;
    }
    if (command === '/sound on' && environment.electron) {
      GLB_electronConfig.sound = true;
      return;
    }
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

  changeNickConfirmar() {
    this.ircproto.sendMessageOrCommand(this.actualServerID, '/nick ' + this.nuevoNick);
    this.cambiarNickPopup = false;
  }

  openPrivateChat(user: string) {
    if (user !== this.actualNick) {
      this.msgPool.addPrivateMessage(this.actualServerID, user);
      this.changeChat(new ChatData(true, user));
    }
  }

  changeNick() {
    this.cambiarNickPopup = true;
    setTimeout(() => {
      document.getElementById('changeNickInput').focus();
    }, 100);
  }

  kpChgNick(event) {
    if (event.keyCode === 13) {
      this.changeNickConfirmar();
    }
  }

  doLeave(channel: string) {
    this.ircproto.sendMessageOrCommand(this.actualServerID, '/leave ' + channel);
  }

  doClose(pc: string) {
    if (this.chatName === pc && this.chatType === CBoxChatTypes.PRIVMSG) {
      if (this.embd) {
        const firstC = this.actualServerAutojoin?.split(',')[0].replace(' ', '');
        if (firstC) {
          this.changeChat(new ChatData(false, firstC))
        } else {
          this.selectServer();
        }
      } else {
        this.selectServer();
      }
      this.msgPool.removePrivateChat(this.actualServerID, pc);
      this.privateChats = this.msgPool.getPrivateChats(this.actualServerID);
    }
  }

  closeChlList(channel: string) {
    this.channelListPopup = false;
    if (channel) {
      this.send('/join ' + channel);
    }
  }

  openHelp() {
    const chnl = this.chatsRooms.find(channel => channel.toLowerCase() === 'hiraclient');
    if (chnl) {
      this.changeChat(new ChatData(false, chnl))
    } else {
      this.send('/join #hiraClient');
    }
  }

  closeGmode(accept: boolean) {
    if (accept) {
      this.send('/accept +' + this.gmode);
    }
    this.gmode = undefined;
  }

  openElectronCFG() {
    this.electronCFG = true;
  }
}
