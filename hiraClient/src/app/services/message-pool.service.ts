import { Injectable, EventEmitter } from '@angular/core';
import { ProcessedMessage, MessageTypes, ChannelUsersDTO, NickChangedDTO, UserLeavingDTO, UserJoiningDTO, IRCMessageDTO, IRCMessage, ChannelTopicDTO } from './IRCParser';
import { PostProcessor, UserWithMetadata } from './PostProcessor';
import { ppid } from 'process';

@Injectable({
  providedIn: 'root'
})
export class MessagePoolService {

  private serversInfo: ServerInfoHash = new ServerInfoHash();

  public usersChanged: EventEmitter<UserDelta> = new EventEmitter<UserDelta>();
  public chatsChanged: EventEmitter<ChatsDelta> = new EventEmitter<ChatsDelta>();
  public serverChanged: EventEmitter<ServersDelta> = new EventEmitter<ServersDelta>();
  public noticed: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  public registerMessage(message: ProcessedMessage<string |
                                                   string[] |
                                                   ChannelUsersDTO |
                                                   NickChangedDTO |
                                                   UserLeavingDTO |
                                                   UserJoiningDTO |
                                                   IRCMessageDTO |
                                                   IRCMessage |
                                                   ChannelTopicDTO>,
                         serverID: string) {
    console.log('Register message', message);
    if (!this.serversInfo[serverID]) {
      this.serversInfo[serverID] = new ServerInfo();
    }
    // Standards messages:
    if (message.messageType === MessageTypes.PRIV_MSG) {
      const data = message.data as IRCMessageDTO;
      const messageProcessed = message as ProcessedMessage<IRCMessageDTO>;
      messageProcessed.data.richMessage = PostProcessor.processMessage(messageProcessed.data.message);
      const newChat = this.serversInfo[serverID].addPrivateMessage(data.author, messageProcessed);
      if (newChat) {
        const cd = new ChatsDelta();
        cd.changeType = DeltaChangeTypes.ADDED;
        cd.chat = data.author;
        cd.isPrivate = true;
        cd.serverID = serverID;
        this.chatsChanged.emit(cd);
      }
      // nuevo mensaje:
      const cd = new ChatsDelta();
      cd.changeType = DeltaChangeTypes.UPDATED;
      cd.chat = data.author;
      cd.message = messageProcessed;
      cd.serverID = serverID;
      this.chatsChanged.emit(cd);
    }
    if (message.messageType === MessageTypes.CHANNEL_MSG) {
      const data = message.data as IRCMessageDTO;
      const messageProcessed = message as ProcessedMessage<IRCMessageDTO>;
      messageProcessed.data.richMessage = PostProcessor.processMessage(messageProcessed.data.message);
      this.addChannelMessage(serverID, data.channel, messageProcessed);
      // nuevo mensaje
      const cd = new ChatsDelta();
      cd.changeType = DeltaChangeTypes.UPDATED;
      cd.chat = data.channel;
      cd.message = messageProcessed;
      cd.serverID = serverID;
      this.chatsChanged.emit(cd);
    }
    if (message.messageType === MessageTypes.SERVER || message.messageType === MessageTypes.NOTICE) {
      this.serversInfo[serverID].serverMessages.push(message as ProcessedMessage<IRCMessage>);
      const sd = new ServersDelta();
      sd.changeType = DeltaChangeTypes.UPDATED;
      sd.serverID = serverID;
      sd.message = message as ProcessedMessage<IRCMessage>;
      this.serverChanged.emit(sd);
    }
    // special processed messages:
    if (message.messageType === MessageTypes.USER_JOINING) {
      const data = message.data as UserJoiningDTO;
      this.addChannelMessage(serverID, data.channel, message as ProcessedMessage<UserJoiningDTO>);
      const newUser = this.serversInfo[serverID].addChannelUser(data.channel, data.user);
      if (newUser) {
        const ud = new UserDelta();
        ud.changeType = DeltaChangeTypes.ADDED;
        ud.user = PostProcessor.processUserMetadata(data.user);
        ud.channel = data.channel;
        ud.serverID = serverID;
        this.usersChanged.emit(ud);
      }
    }
    if (message.messageType === MessageTypes.USER_LEAVING) {
      const data = message.data as UserLeavingDTO;
      this.addChannelMessage(serverID, data.channel, message as ProcessedMessage<UserLeavingDTO>);
      const removedUser = this.serversInfo[serverID].removeChannelUser(data.channel, data.user);
      if (removedUser) {
        const ud = new UserDelta();
        ud.changeType = DeltaChangeTypes.DELETED;
        ud.user = PostProcessor.processUserMetadata(data.user);
        ud.channel = data.channel;
        ud.serverID = serverID;
        this.usersChanged.emit(ud);
      }
    }
    // only for changes
    if (message.messageType === MessageTypes.CHANNEL_USERS) {
      const data = message.data as ChannelUsersDTO;
      this.serversInfo[serverID].addChannelUsers(data.channel, data.users);
      const ud = new UserDelta();
      ud.changeType = DeltaChangeTypes.FULL_LIST;
      ud.channel = data.channel;
      ud.serverID = serverID;
      this.usersChanged.emit(ud);
    }
    if (message.messageType === MessageTypes.CHANNEL_TOPIC) {
      console.log('Channel topic');
      const data = message.data as ChannelTopicDTO;
      this.serversInfo[serverID].channelTopics[data.channel] = data.topic;
    }
    if (message.messageType === MessageTypes.MOTD) {
      // si es el primer notice avisamos
      if (!this.serversInfo[serverID].noticed) {
        this.serversInfo[serverID].noticed = true;
        this.noticed.emit(serverID);
      }
    }
    if (message.messageType === MessageTypes.QUIT) {
      Object.entries(this.serversInfo[serverID].channelUsers).forEach(kv => {
        kv[1].forEach(user => {
          if (user.nick === message.data) {
            if (this.serversInfo[serverID].removeChannelUser(kv[0], user.nick)) {
              const pp = new ProcessedMessage<UserLeavingDTO>();
              pp.messageType = MessageTypes.USER_LEAVING;
              pp.data = {
                user: user.nick,
                channel: kv[0],
                message: 'QUIT'
              };
              this.addChannelMessage(serverID, kv[0], pp);
              const ud = new UserDelta();
              ud.changeType = DeltaChangeTypes.DELETED;
              ud.user = user;
              ud.channel = kv[0];
              ud.serverID = serverID;
              this.usersChanged.emit(ud);
            }
          }
        });
      });
    }
  }

  public getChannelTopic(serverID: string, channel: string): string {
    return this.serversInfo[serverID].channelTopics[channel];
  }

  private addChannelMessage(serverID, channel, message: ProcessedMessage<IRCMessageDTO | UserJoiningDTO | UserLeavingDTO>) {
    const newChat = this.serversInfo[serverID].addChannelMessage(channel, message);
    if (newChat) {
      const cd = new ChatsDelta();
      cd.changeType = DeltaChangeTypes.ADDED;
      cd.chat = channel;
      cd.isPrivate = false;
      cd.serverID = serverID;
      this.chatsChanged.emit(cd);
    }
  }

  public getPrivateChats(serverID: string): string[] {
    return this.serversInfo[serverID].privateChats;
  }

  public closePrivateChat(serverID: string, author: string) {
    this.serversInfo[serverID].removePrivateChat(author);
  }

  public getPrivateMessages(serverID: string, author: string): ProcessedMessage<IRCMessageDTO>[] {
    return this.serversInfo[serverID].privateMessages[author];
  }

  public getChannelMessages(serverID: string, channel: string): ProcessedMessage<IRCMessageDTO | UserJoiningDTO | UserLeavingDTO>[] {
    return this.serversInfo[serverID].channelMessages[channel];
  }

  public getServerMessages(serverID: string): ProcessedMessage<IRCMessage>[] {
    return this.serversInfo[serverID].serverMessages;
  }

  public getChannels(serverID: string): string[] {
    return this.serversInfo[serverID].channels;
  }

  public getChannelUsers(serverID: string, channel: string): UserWithMetadata[] {
    return this.serversInfo[serverID].channelUsers[channel];
  }

  public addPrivateMessage(serverID: string, user: string) {
    if (this.serversInfo[serverID].addPrivateChat(user)) {
      const cd = new ChatsDelta();
      cd.changeType = DeltaChangeTypes.ADDED;
      cd.chat = user;
      cd.isPrivate = true;
      cd.serverID = serverID;
      this.chatsChanged.emit(cd);
    }
  }
}

export class ServerInfoHash {
  [key: string]: ServerInfo;
}

export class TopicsHash {
  [key: string]: string;
}

export class ServerInfo {
  public privateMessages: MessagesHash<IRCMessageDTO> = {};
  public channelMessages: MessagesHash<IRCMessageDTO | UserJoiningDTO | UserLeavingDTO> = {};
  public serverMessages: ProcessedMessage<IRCMessage>[] = [];
  public channelUsers: UsersInChannelHash = {};
  public channels: string[] = [];
  public privateChats: string[] = [];
  public channelTopics: TopicsHash = {};
  public noticed = false;

  public addChannelMessage(channel: string, message: ProcessedMessage<IRCMessageDTO | UserJoiningDTO | UserLeavingDTO>): boolean {
    channel = channel[0] === '#' ? channel.slice(1) : channel;
    let isNew = false;
    if (!this.channelMessages[channel]) {
      this.channelMessages[channel] = [];
      this.addChannel(channel);
      isNew = true;
    }
    this.channelMessages[channel].push(message);
    return isNew;
  }

  // retorna true si es nuevo
  public addPrivateMessage(author: string, message: ProcessedMessage<IRCMessageDTO>): boolean {
    if (!this.privateMessages[author]) {
      this.privateMessages[author] = [];
    }
    this.privateMessages[author].push(message);
    return this.addPrivateChat(author);
  }

  public removePrivateChat(author: string) {
    const idx = this.privateChats.findIndex(a => a === author);
    if (idx >= 0) {
      this.privateChats.splice(idx, 1);
    }
  }

  public addPrivateChat(author): boolean {
    if (this.privateChats.findIndex(a => a === author) === -1) {
      this.privateChats.push(author);
      return true;
    }
    return false;
  }

  public addChannelUser(channel: string, user: string): boolean {
    channel = channel[0] === '#' ? channel.slice(1) : channel;
    if (!this.channelUsers[channel]) {
      this.channelUsers[channel] = [];
    }
    const userMD = PostProcessor.processUserMetadata(user);
    console.log('Adding user, ', channel, this.channelUsers[channel], userMD);
    if (this.channelUsers[channel].findIndex(u => u.nick === userMD.nick) === -1) {
      this.channelUsers[channel].push(userMD);
      return true;
    }
    return false;
  }

  public addChannelUsers(channel: string, users: string[]): boolean {
    channel = channel[0] === '#' ? channel.slice(1) : channel;
    if (!this.channelUsers[channel]) {
      this.channelUsers[channel] = [];
    }
    users.forEach(user => {
      const userMD = PostProcessor.processUserMetadata(user);
      if (this.channelUsers[channel].findIndex(u => u.nick === userMD.nick) === -1) {
        this.channelUsers[channel].push(userMD);
        return true;
      }
    });
    return false;
  }

  public removeChannelUser(channel: string, user: string): boolean {
    channel = channel[0] === '#' ? channel.slice(1) : channel;
    const userMD = PostProcessor.processUserMetadata(user);
    if (!this.channelUsers[channel]) {
      this.channelUsers[channel] = [];
    }
    const idx = this.channelUsers[channel].findIndex(u => u.nick === userMD.nick);
    if (idx >= 0) {
      this.channelUsers[channel].splice(idx, 1);
      return true;
    }
    return false;
  }

  public addChannel(channel: string) {
    channel = channel[0] === '#' ? channel.slice(1) : channel;
    if (this.channels.findIndex(c => c === channel) === -1) {
      this.channels.push(channel);
    }
  }

  public removeChannel(channel: string) {
    channel = channel[0] === '#' ? channel.slice(1) : channel;
    const idx = this.channels.findIndex(c => c === channel);
    if (idx >= 0) {
      this.channels.splice(idx, 1);
    }
  }
}

export class UsersInChannelHash {
  [key: string]: UserWithMetadata[];
}

export class MessagesHash<t> {
  [key: string]: ProcessedMessage<t>[];
}

export enum DeltaChangeTypes {
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  ADDED = 'ADDED',
  FULL_LIST = 'FULL_LIST'
}

export class ChangeDelta {
  public changeType: DeltaChangeTypes;
  public serverID: string;
}

export class UserDelta extends ChangeDelta {
  public user?: UserWithMetadata;
  public channel: string;
}

export class ChatsDelta extends ChangeDelta {
  public chat: string;
  public isPrivate?: boolean;
  public message?: ProcessedMessage<IRCMessageDTO>;
}

export class ServersDelta extends ChangeDelta {
  public message: ProcessedMessage<IRCMessage>;
}
