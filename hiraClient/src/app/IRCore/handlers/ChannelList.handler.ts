import { EventEmitter } from '@angular/core';
import { Channel } from '../dto/Channel';

/*
  Clase para manejar los canales que tiene un usuario.
*/
export class ChannelListHandler {

  private static uChannelList: UserChannelList = {};
  public static readonly channelListUpdated: EventEmitter<UpdateChannelList> = new EventEmitter<UpdateChannelList>();

  public static setChannelList(user: string, channelList: Channel[]) {
    // FIXME: update the same instance.
    this.uChannelList[user] = channelList;
    this.channelListUpdated.emit(new UpdateChannelList(user, channelList));
  }

  public static getChannels(): UserChannelList {
    return this.uChannelList;
  }

}

export class UserChannelList {
  [key: string]: Channel[];
}

export class UpdateChannelList {
  user: string;
  channels: Channel[] = [];
  constructor(user: string, channels: Channel[]) {
    this.user = user;
    this.channels = channels;
  }
}
