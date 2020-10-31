import { UserInfoService } from './user-info.service';
import { OnTopicUpdate } from './../handlers/ChannelStatus.handler';
import { ChannelListHandler, OnChannelList } from './../handlers/ChannelList.handler';
import { OnUserList, UsersHandler } from './../handlers/Users.handler';
import { PartHandler } from './../handlers/Part.handler';
import { KickHandler, OnKick } from './../handlers/Kick.handler';
import { JoinHandler, OnJoin } from './../handlers/Join.handler';
import { Injectable } from '@angular/core';
import { ChannelData } from './ChannelData';
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

/**
 * Servicio para gestionar mis canales y los usuarios en esos canales
 */
@Injectable({
  providedIn: 'root'
})
export class ChannelsService implements OnJoin, OnPart, OnKick, OnUserList, OnChannelList, OnNickChanged, OnTopicUpdate {

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
    const channelObj = this.channels.find(chnl => chnl.name = channel);
    // si no existe este canal lo agregamos.
    if (!channelObj) {
      this.addChannel(channel);
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
  }

  onKick(data: KickInfo) {
    if (data.userTarget.nick === this.userSrv.getNick()) {
      //
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
    }
  }

  onPart(data: Part) {
    if (data.user.nick === this.userSrv.getNick()) {

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
    }
  }

  onJoin(data: Join) {
    if (data.user.nick === this.userSrv.getNick()) {
      if (!this.channels.find(chnl => chnl.name === data.channel.name)) {
        this.addChannel(data.channel.name);
      }
    } else {
      const chnlObj = this.channels.find(chnl => chnl.name === data.channel.name);
      if (chnlObj) {
        const newUser = new User(data.user.nick);
        newUser.mode = data.user.mode;
        chnlObj.users.push(newUser);
      } else {
        console.error('No se encontró el canal en el que se unió el usuario.', data.channel);
      }
    }
  }

  onNickChanged(nick: NickChange) {
    // buscar en la lista de usuarios en cada canal el nick y cambiarlo
    this.channels.forEach(chnl => {
      const oldUsr = chnl.users.find(usr => usr.nick === nick.oldNick);
      oldUsr.nick = nick.newNick;
    });
  }

  onTopicUpdate(channel: string, newTopic: string) {
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
}
