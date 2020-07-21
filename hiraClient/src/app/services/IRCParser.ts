export class IRCParser {
  public static parseMessage(message: string): IRCMessage[] {
      const out = [];
      message.split('\r\n').forEach(msgLine => {
          const r = /:([^:]+):?(.*)/.exec(msgLine);
          const TAG = r[1];
          const MSG = r[2];
          const partials = TAG.split(' ');
          const im = new IRCMessage();
          im.code = partials[1];
          const target = /([^!]*!)?([^@]+@)?(.*)/.exec(partials[0]);
          const od = new OriginData();
          if (!target[2]) {
              od.server = target[1];
              im.simplyOrigin = od.server;
          } else if (!target[3]) {
              od.server = target[2];
              od.identitity = target[1].slice(0, target[1].length - 1);
              im.simplyOrigin = od.identitity;
          } else {
              od.server = target[3];
              od.identitity = target[2].slice(0, target[1].length - 1);
              od.nick = target[1].slice(0, target[1].length - 1);
              im.simplyOrigin = od.nick;
          }
          im.origin = od;
          im.target = partials[2];
          im.message = MSG;
          out.push(im);
      });
      return out;
  }

  public static findChannels(message: string): string[] {
    let channels = /#([^\s]+)/g.exec(message) as Array<string>;
    channels = channels.slice(1);
    return channels;
  }

  public static getChannelOfUsers(message: string) {
      return /=([^:]+):/.exec(message)[1].trim();
  }

  public static processMessage(parsedMessage: IRCMessage, rawMessage: string, actualNick: string):
  ProcessedMessage<
                  string |
                  string[] |
                  ChannelUsersDTO |
                  NickChangedDTO |
                  UserLeavingDTO |
                  UserJoiningDTO |
                  IRCMessageDTO |
                  ChannelTopicDTO |
                  IRCMessage // raw for server messages
                  > {
    const msg = new IRCMessage();
    // 464 bad bouncer connection?
    if (parsedMessage.code === '319') { // lista de canales
      if (parsedMessage.target === actualNick) {
        const out = new ProcessedMessage<string[]>();
        out.messageType = MessageTypes.CHANNEL_LIST;
        const channels = [];
        parsedMessage.message.split(' ').forEach(pmChnl => {
          channels.push(pmChnl);
        });
        out.data = channels;
        return out;
      }
    }

    if (parsedMessage.code === '353') {
      const channel = IRCParser.getChannelOfUsers(rawMessage); // creo que esto trae los usuarios de un canal:
      const users = parsedMessage.message.trim().split(' ');
      const out = new ProcessedMessage<ChannelUsersDTO>();
      out.messageType = MessageTypes.CHANNEL_USERS;
      out.data = {
        channel,
        users
      };
      return out;
    }

    if (parsedMessage.code === '433') { // nick already in use
      const out = new ProcessedMessage<undefined>();
      out.messageType = MessageTypes.NICK_ALREADY_IN_USE;
      return out;
      // this.send(server.id, 'nick ' + server.apodoSecundario);
      // this.websockets[server.id].actualNick = server.apodoSecundario;
    }

    if (parsedMessage.code === 'NICK') {
      // nos cambiaron el nick o se lo cambió alguien.
      if (parsedMessage.simplyOrigin === actualNick) { // nos cambiaron el nick
        const out = new ProcessedMessage<string>();
        out.messageType = MessageTypes.OUR_NICK_CHANGED;
        out.data = parsedMessage.target;
        return out;
      } else { // se lo cambiaron a alguien:
        const out = new ProcessedMessage<NickChangedDTO>();
        out.messageType = MessageTypes.NICK_CHANGED;
        out.data = {
          origin: parsedMessage.simplyOrigin,
          newNick: parsedMessage.target
        };
        return out;
      }
    }

    if (parsedMessage.code === '396') { // displayed host REVEER ESTO
      // check channels:
      // this.send(server.id, 'WHOIS ' + this.websockets[server.id].actualNick);
      // // autologin
      // if (server.method === 'nickserv') {
      //   this.send(server.id, 'PRIVMSG nickserv identify ' + server.password);
      // }
      // // autojoin
      // if (server.autojoin) {
      //   const channels = server.autojoin.split(' ');
      //   channels.forEach(joinChannel => {
      //     console.log('Joining to ' + joinChannel);
      //     this.send(server.id, 'JOIN ' + joinChannel);
      //     this.addChannelMSG(server.id, joinChannel);
      //   });
      // }
    }

    if (parsedMessage.code === '464') {
      // if (server.method === 'spassword') {
      //   this.send(server.id, 'PASS ' + server.username + ':' + server.password);
      //   this.send(server.id, 'nick ' + server.apodo);
      //   this.websockets[server.id].actualNick = server.apodo;
      // }
    }

    if (parsedMessage.code === '322') {
      // real channel list.
      // const channel = IRCParser.getChannelOfUsers(message);
      // const users = parsedMessage.message.trim().split(' ');
      // this.websockets[server.id].users[channel] = users;
    }

    if (parsedMessage.code === '332') {
      const channels = IRCParser.findChannels(rawMessage);
      const out = new ProcessedMessage<ChannelTopicDTO>();
      out.messageType = MessageTypes.CHANNEL_TOPIC;
      out.data = {
        channel: channels[0],
        topic: parsedMessage.message,
      };
      return out;
    }

    if (parsedMessage.code === 'PART') {
      // :Harko!~Harkolandia@harkonidaz.irc.tandilserver.com PART #SniferL4bs :"Leaving"
      const channel = parsedMessage.target;
      const user = parsedMessage.simplyOrigin;
      const message = parsedMessage.message;
      // user leaving (message)
      const out = new ProcessedMessage<UserLeavingDTO>();
      out.messageType = MessageTypes.USER_LEAVING;
      out.data = {
        channel,
        user,
        message
      };
      return out;
    }

    if (parsedMessage.code === 'JOIN') {
      // :Harko!~Harkolandia@harkonidaz.irc.tandilserver.com JOIN :#SniferL4bs
      const channel = parsedMessage.message;
      const user = parsedMessage.simplyOrigin;
      const fullUser = parsedMessage.origin;
      const userMsg = parsedMessage.origin.nick + ' (' + parsedMessage.origin.identitity + '@' + parsedMessage.origin.server + ') Joining';
      const out = new ProcessedMessage<UserJoiningDTO>();
      out.messageType = MessageTypes.USER_JOINING;
      out.data = {
        channel,
        user,
        fullUser,
        userMsg
      };
      return out;
    }

    if (parsedMessage.code === 'PRIVMSG') {
      // es mensaje /me ?
      const meMsg = /\x01ACTION ([^\x01]+)\x01/.exec(parsedMessage.message);
      const out = new ProcessedMessage<IRCMessageDTO>();
      if (meMsg) {
        out.data = {
          author: parsedMessage.simplyOrigin,
          message:  meMsg[1],
          meAction: true
        };
      } else {
        out.data = {
          author: parsedMessage.simplyOrigin,
          message: parsedMessage.message,
          meAction: false
        };
      }
      out.data.time = IRCParser.getTime();
      out.data.date = IRCParser.getDateStr();
      if (parsedMessage.target === actualNick) { // privado
        out.messageType = MessageTypes.PRIV_MSG;
      } else {
        out.messageType = MessageTypes.CHANNEL_MSG;
        out.data.channel = parsedMessage.target;
      }
      out.data.mention = msg.message ? msg.message.indexOf(actualNick) >= 0 : false;
      return out;
    }

    console.log('Uknown message: ', parsedMessage);
    const out = new ProcessedMessage<IRCMessage>();
    out.messageType = MessageTypes.SERVER;
    out.data = parsedMessage;
    return out;
  }

  public static getTime(): string {
    const now = new Date();
    const hours = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
    const min = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
    const second = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
    return hours + ':' + min + ':' + second;
  }

  public static getDateStr(): string {
    const now = new Date();
    const month = (now.getMonth() + 1);
    const monthStr = month < 10 ? '0' + month : month;
    const day = now.getDate();
    const dayStr = day < 10 ? '0' + day : day;
    return dayStr + '/' + monthStr + '/' + now.getFullYear();
  }

}

export class IRCMessage {
  public origin: OriginData;
  public simplyOrigin: string;
  public code: string;
  public target: string;
  public message: string;
}

export class OriginData {
  public nick?: string;
  public identitity?: string;
  public server: string;
}

export class ProcessedMessage<dataType> {
  public messageType: MessageTypes;
  public data: dataType;
}

export enum MessageTypes {
  CHANNEL_LIST = 'CHANNEL_LIST',
  CHANNEL_USERS = 'CHANNEL_USERS',
  NICK_ALREADY_IN_USE = 'NICK_ALREADY_IN_USE',
  OUR_NICK_CHANGED = 'OUR_NICK_CHANGED',
  NICK_CHANGED = 'NICK_CHANGED',
  USER_LEAVING = 'USER_LEAVING',
  USER_JOINING = 'USER_JOINING',
  PRIV_MSG = 'PRIV_MSG',
  CHANNEL_MSG = 'CHANNEL_MSG',
  SERVER = 'SERVER',
  CHANNEL_TOPIC = 'CHANNEL_TOPIC'
}

export interface ChannelTopicDTO {
  channel: string;
  topic: string;
}

export interface ChannelUsersDTO {
  channel: string;
  users: string[];
}

export interface NickChangedDTO {
  origin: string;
  newNick: string;
}

export interface UserLeavingDTO {
  channel: string;
  user: string;
  message: string;
}

export interface UserJoiningDTO {
  channel: string;
  user: string;
  fullUser: OriginData;
  userMsg: string;
}

export interface IRCMessageDTO {
  author: string;
  message: string;
  meAction: boolean;
  time?: string;
  date?: string;
  channel?: string;
  mention?: boolean;
  privateAuthor?: string; // when i send private message my nick is here.
}
