import { ModeHandler } from './../handlers/Mode.handler';
import { IndividualMessage, IndividualMessageTypes } from './../dto/IndividualMessage';
import { MessageHandler, OnMessageReceived } from './../handlers/Message.handler';
import { UserInfoService } from './user-info.service';
import { OnTopicUpdate } from './../handlers/ChannelStatus.handler';
import { ChannelListHandler, OnChannelList } from './../handlers/ChannelList.handler';
import { OnUserList, UsersHandler } from './../handlers/Users.handler';
import { PartHandler } from './../handlers/Part.handler';
import { KickHandler, OnKick } from './../handlers/Kick.handler';
import { JoinHandler, OnJoin } from './../handlers/Join.handler';
import { Injectable, EventEmitter } from '@angular/core';
import { Author, ChannelData, GenericMessage } from './ChannelData';
import { Join } from '../dto/Join';
import { OnPart } from '../handlers/Part.handler';
import { Part } from '../dto/Part';
import { KickInfo } from '../dto/KickInfo';
import { UserInChannel } from '../dto/UserInChannel';
import { Channel } from '../dto/Channel';
import { OnNickChanged, StatusHandler } from '../handlers/Status.handler';
import { NickChange } from '../dto/NickChange';
import { User } from '../dto/User';
import { ChannelStatusHandler } from '../handlers/ChannelStatus.handler';
import { NewMode } from '../dto/NewMode';
import { UModes } from '../utils/UModes.utils';
import { PostProcessor } from '../utils/PostProcessor';

/**
 * Servicio para gestionar mis canales y los usuarios en esos canales
 */
@Injectable({
  providedIn: 'root'
})
export class ChannelsService implements OnJoin, OnPart, OnKick, OnUserList, OnChannelList, OnNickChanged, OnTopicUpdate, OnMessageReceived {

  public readonly listChanged: EventEmitter<ChannelData[]> = new EventEmitter<ChannelData[]>();
  public readonly messagesReceived: EventEmitter<GenericMessage> = new EventEmitter<GenericMessage>();
  public readonly membersChanged: EventEmitter<{channel: string, users: User[]}> = new EventEmitter<{channel: string, users: User[]}>();

  private channels: ChannelData[] = [];

  constructor(private userSrv: UserInfoService) {
    // Subscribe to events
    JoinHandler.setHandler(this);
    KickHandler.setHandler(this);
    PartHandler.setHandler(this);
    UsersHandler.setHandler(this);
    ChannelListHandler.setHandler(this);
    StatusHandler.setHandlerNickChanged(this);
    ChannelStatusHandler.setHandler(this);
    MessageHandler.setHandler(this);
    ModeHandler.modeChange.subscribe((d: NewMode) => {
      if(d.channelTarget != d.userTarget.nick) {
        const channel = d.channelTarget[0] == '#' ? d.channelTarget.substring(1) : d.channelTarget;
        let channelObj = this.channels.find(chnl => chnl.name === channel);
        if(channelObj) {
          const user = channelObj.users.find(user => user.nick === d.userTarget.nick);
          if(user) {
            if(d.modeAdded) {
              if(d.mode.indexOf('q') > -1) {
                user.mode = UModes.FOUNDER;
              } else if(d.mode.indexOf('a') > -1 || d.mode.indexOf('A') > -1) {
                user.mode = UModes.ADMIN;
              } else if(d.mode.indexOf('o') > -1 || d.mode.indexOf('O') > -1) {
                user.mode = UModes.OPER;
              } else if(d.mode.indexOf('h') > -1 || d.mode.indexOf('H') > -1) {
                user.mode = UModes.HALFOPER;
              } else if(d.mode.indexOf('v') > -1 || d.mode.indexOf('V') > -1) {
                user.mode = UModes.VOICE;
              }
            } else {
              user.mode = undefined; // FIXME: acá habría que ver que modos le quedan.
            }
            this.membersChanged.emit({
              channel,
              users: channelObj.users
            });
          }
        }
      }
    });
  }

  onChannelList(user: string, channels: Channel[]) {
    // actualizamos nuestra lista de canales:
    if (user === this.userSrv.getNick()) {
      // agregamos nuevos canales
      const actualChnls = [];
      channels.forEach(channel => {
        const oldChnl = this.channels.find(chnl => chnl.name === channel.name);
        if (!oldChnl) {
          this.addChannel(channel.name);
        }
        actualChnls.push(channel.name);
      });
      // buscamos elementos inexistentes
      this.channels.forEach((channel, idx) => {
        if (!actualChnls.find(chName => chName === channel.name)) {
          this.channels.splice(idx, 1);
        }
      });
      this.listChanged.emit(this.channels);
    }
  }

  private addChannel(channel: string) {
    const nChannel = new ChannelData();
    nChannel.name = channel;
    nChannel.topic = ChannelStatusHandler.getChannelTopic(nChannel.name);
    nChannel.messages = []; // Get from log?
    this.channels.push(nChannel);
    return nChannel;
  }

  onUserList(channel: string, users: UserInChannel[]) {
    let channelObj = this.channels.find(chnl => chnl.name === channel);
    // si no existe este canal lo agregamos.
    if (!channelObj) {
      channelObj = this.addChannel(channel);
    }
    const actualUsers = [];
    users.forEach(currentUser => {
      const oldUser = channelObj.users.find(user => user.nick === currentUser.nick);
      if (!oldUser) {
        const newUser = new User(currentUser.nick);
        newUser.mode = currentUser.mode;
        channelObj.users.push(newUser);
      } else {
        oldUser.mode = currentUser.mode;
      }
      actualUsers.push(currentUser.nick);
    });
    // buscamos usuarios que ya no estan
    channelObj.users.forEach((user, idx) => {
      if (!actualUsers.find(acu => user.nick === acu)) {
        channelObj.users.splice(idx, 1);
      }
    });
    this.membersChanged.emit({channel: channel, users: channelObj.users});
  }

  onKick(data: KickInfo) {
    if (data.userTarget.nick === this.userSrv.getNick()) {
      this.listChanged.emit(this.channels);
    } else {
      const chnlObj = this.channels.find(chnl => chnl.name === data.channel.name);
      if (chnlObj) {
        const idx = chnlObj.users.findIndex(user => user.nick === data.userTarget.nick);
        if (idx >= 0) {
          chnlObj.users.splice(idx, 1);
        }
      } else {
        console.error('No se encontró el canal en el que se kickeó el usuario.', data.channel);
      }
      this.membersChanged.emit({channel: data.channel.name, users: chnlObj.users});
    }

  }

  onPart(data: Part) {
    if (data.user.nick === this.userSrv.getNick()) {
      this.listChanged.emit(this.channels);
    } else {
      const chnlObj = this.channels.find(chnl => chnl.name === data.channel.name);
      if (chnlObj) {
        const idx = chnlObj.users.findIndex(user => user.nick === data.user.nick);
        if (idx >= 0) {
          chnlObj.users.splice(idx, 1);
        }
      } else {
        console.error('No se encontró el canal en el que partió el usuario.', data.channel);
      }
      this.membersChanged.emit({channel: data.channel.name, users: chnlObj.users});
    }
  }

  onJoin(data: Join) {
    if (data.user.nick === this.userSrv.getNick()) {
      if (!this.channels.find(chnl => chnl.name === data.channel.name)) {
        this.addChannel(data.channel.name);
      }
      this.listChanged.emit(this.channels);
    } else {
      const chnlObj = this.channels.find(chnl => chnl.name === data.channel.name);
      if (chnlObj) {
        const newUser = new User(data.user.nick);
        newUser.mode = data.user.mode;
        chnlObj.users.push(newUser);
      } else {
        console.error('No se encontró el canal en el que se unió el usuario.', data.channel);
      }
      this.membersChanged.emit({channel: data.channel.name, users: chnlObj.users});
    }
  }

  onNickChanged(nick: NickChange) {
    // buscar en la lista de usuarios en cada canal el nick y cambiarlo
    this.channels.forEach((chnl: ChannelData) => {
      const oldUsr = chnl.users.find(usr => usr.nick === nick.oldNick);
      oldUsr.nick = nick.newNick;
      this.membersChanged.emit({channel: chnl.name, users: chnl.users});
    });
  }

  onTopicUpdate(channel: string, newTopic: string) {
    if(channel[0] === '#') {
      channel = channel.substring(1);
    }
    const chnlObj = this.channels.find(chnl => chnl.name === channel);
    if (chnlObj) {
      chnlObj.topic = newTopic;
    } else {
      console.error('No se encontró el canal en el que se cambió el topic. ', channel);
    }
  }

  getChannels() {
    return this.channels;
  }

  getChannel(channel: string) {
    return this.channels.find(chanObj => chanObj.name == channel);
  }

  onMessageReceived(message: IndividualMessage) {
    if(message.messageType == IndividualMessageTypes.CHANMSG) {
      const tgtChan =  message.channel[0] == '#' ?  message.channel.substring(1) :  message.channel;
      const chanObj = this.channels.find(chan => chan.name == tgtChan);
      const msg: GenericMessage = {
        message: (message.message as string),
        messageWithMetadata:  PostProcessor.processMessage(message.message as string, message.author),
        author: new Author<string>(message.author),
        date: message.date + ' ' + message.time,
        special: message.meAction,
        quote: undefined
      };
      chanObj.messages.push(msg);
      this.messagesReceived.emit(msg);
    }
  }
}
