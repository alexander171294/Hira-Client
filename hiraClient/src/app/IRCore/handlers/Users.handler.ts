import { EventEmitter } from '@angular/core';
import { UserInChannel } from '../dto/UserInChannel';

/*
  Clase para manejar los usuarios que hay en un canal
*/
export class UsersHandler {

  private static readonly usersInChannel: ChannelUserList = {};
  public static readonly usersInChannelResponse: EventEmitter<UserInChannel[]> = new EventEmitter<UserInChannel[]>();

  public static addUsersToChannel(channel: string, users: UserInChannel[]) {
    this.usersInChannel[channel] = users;
    this.usersInChannelResponse.emit(users);
  }

  public static getChannelOfMessage(message: string) {
    return /(=|@)([^:]+):/.exec(message)[2].trim();
  }

  public static getUsersInChannel(channel: string): UserInChannel[] {
    return this.usersInChannel[channel];
  }

}

export class ChannelUserList {
  [key: string]: UserInChannel[];
}
