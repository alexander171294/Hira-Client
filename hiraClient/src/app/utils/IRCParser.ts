import { MessageWithMetadata, UserStatuses } from '../utils/PostProcessor';

export class IRCParser {
  public static parseMessage(message: string): IRCMessage[] {
      const out = [];
      message.split('\r\n').forEach(msgLine => {
          const r = /:([^:]+):?(.*)/.exec(msgLine);
          const TAG = r[1];
          const MSG = r[2];
          const partials = TAG.split(' ');
          const im = new IRCMessage();
          im.body = MSG;
          im.tag = TAG;
          im.partials = partials;
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
    return /(=|@)([^:]+):/.exec(message)[2].trim();
  }

  public static WHOUserParser(message: string) {
    return /:([^\s]+)\s([0-9]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)\s(H|G)(\*?)(\~|\&|\@|\%|\+)?/.exec(message);
    /*
      grups:
      1: server
      2: code
      3: me nick
      4: channel or user target
      5: Name
      6: vhost
      7: server from
      8: Nick
      9: H or G if is away
      10: * if is NET OP
      11: mode in channel
    */
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
                  IRCMessage |
                  KickedDTO |
                  ChannelListDTO |
                  ModeChangeDTO // raw for server messages
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

    if (parsedMessage.code === '352') { // user info (WHO response)
      const data = IRCParser.WHOUserParser(rawMessage);
      if (data) {
        const out = new ProcessedMessage<any>();
        out.messageType = MessageTypes.WHO_DATA;
        const mod = data[11];
        out.data = {
          serverFrom: data[7],
          nick: data[8],
          isAway: data[9] === 'G',
          isNetOp: data[10] === '*',
          rawMsg: rawMessage,
          mode: data[11]
        };
        if (mod === '~') {
          out.data.mode = UserStatuses.FOUNDER;
        } else if (mod === '&') {
          out.data.mode = UserStatuses.NET_OPERATOR;
        } else if (mod === '@') {
          out.data.mode = UserStatuses.OPERATOR;
        } else if (mod === '%') {
          out.data.mode = UserStatuses.HALF_OPERATOR;
        } else if (mod === '+') {
          out.data.mode = UserStatuses.VOICE;
        }
        return out;
      } else {
        console.error('BAD WHO RESPONSE PARSED: ', rawMessage, data);
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

    // 321 inicio lista de canales (borrar)
    if (parsedMessage.code === '321') {
      const out = new ProcessedMessage<string>();
      out.messageType = MessageTypes.CLEAN_CHANNEL_LIST;
      return out;
    }
    // 322 canal de lista de canales
    if (parsedMessage.code === '322') {
      const out = new ProcessedMessage<ChannelListDTO>();
      out.messageType = MessageTypes.CHANNEL_LIST_APPEND;
      out.data = {
        name: parsedMessage.partials[3],
        description: parsedMessage.body
      };
      return out;
    }

    // TODO: /whois command

    if (parsedMessage.code === '433') { // nick already in use
      const out = new ProcessedMessage<undefined>();
      out.messageType = MessageTypes.NICK_ALREADY_IN_USE;
      return out;
      // this.send(server.id, 'nick ' + server.apodoSecundario);
      // this.websockets[server.id].actualNick = server.apodoSecundario;
    }

    if (parsedMessage.code === '474') {
      const out = new ProcessedMessage<undefined>();
      out.messageType = MessageTypes.IM_BANNED;
      return out;
    }

    if (parsedMessage.code === 'NICK') {
      // nos cambiaron el nick o se lo cambió alguien.
      if (parsedMessage.simplyOrigin === actualNick) { // nos cambiaron el nick
        const out = new ProcessedMessage<NickChangedDTO>();
        out.messageType = MessageTypes.OUR_NICK_CHANGED;
        out.data = {
          origin: actualNick,
          newNick: parsedMessage.target ? parsedMessage.target : parsedMessage.message
        };
        return out;
      } else { // se lo cambiaron a alguien:
        const out = new ProcessedMessage<NickChangedDTO>();
        out.messageType = MessageTypes.NICK_CHANGED;
        out.data = {
          origin: parsedMessage.simplyOrigin,
          newNick: parsedMessage.target ? parsedMessage.target : parsedMessage.message
        };
        return out;
      }
    }

    if (parsedMessage.code === 'MODE') {
      const out = new ProcessedMessage<ModeChangeDTO>();
      out.messageType = MessageTypes.MODE_CHANGE;
      const mode = /(\+|\-)([a-zA-Z]+)\s(.*)/.exec(rawMessage);
      if (mode) {
        out.data = {
          target: mode[3],
          channel: parsedMessage.target,
          modeAdded: mode[1] === '+',
          mode: mode[2]
        };
        return out;
      }
    }

    if (parsedMessage.code === '301') { // away message
      const out = new ProcessedMessage<IRCMessageDTO>();
      out.messageType = MessageTypes.PRIV_MSG;
      out.data = {
        author: parsedMessage.partials[3],
        message: parsedMessage.message,
        meAction: true,
        specialAction: true,
        isAwayNotify: true,
        time: IRCParser.getTime(),
        date: IRCParser.getDateStr(),
        notifyAction: false
      };
      return out;
    }

    if (parsedMessage.code === '716') { // server side ignored
      const out = new ProcessedMessage<IRCMessageDTO>();
      out.messageType = MessageTypes.PRIV_MSG;
      out.data = {
        author: parsedMessage.partials[3],
        message: ': Ausente (' + parsedMessage.message + ')',
        meAction: true,
        specialAction: true,
        notifyAction: false
      };
      out.data.time = IRCParser.getTime();
      out.data.date = IRCParser.getDateStr();
      return out;
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
      const out = new ProcessedMessage<IRCMessage>();
      out.messageType = MessageTypes.BOUNCER;
      out.data = parsedMessage;
      return out;
      // if (server.method === 'spassword') {
      //   this.send(server.id, 'PASS ' + server.username + ':' + server.password);
      //   this.send(server.id, 'nick ' + server.apodo);
      //   this.websockets[server.id].actualNick = server.apodo;
      // }
    }

    if (parsedMessage.code === '375') {
      const out = new ProcessedMessage<IRCMessage>();
      out.messageType = MessageTypes.MOTD;
      out.data = parsedMessage;
      return out;
    }

    if (parsedMessage.code === 'NOTICE') {
      if (parsedMessage.simplyOrigin && parsedMessage.simplyOrigin !== '*status' && parsedMessage.target[0] === '#') {
        const out = new ProcessedMessage<IRCMessageDTO>();
        out.messageType = MessageTypes.CHANNEL_MSG;
        out.data = {
          author: parsedMessage.simplyOrigin,
          channel: parsedMessage.target,
          message: parsedMessage.message,
          meAction: false,
          notifyAction: true
        };
        out.data.time = IRCParser.getTime();
        out.data.date = IRCParser.getDateStr();
        return out;
      } else {
        const out = new ProcessedMessage<IRCMessage>();
        out.messageType = MessageTypes.NOTICE;
        out.data = parsedMessage;
        return out;
      }
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

    if (parsedMessage.code === 'TOPIC') {
      const out = new ProcessedMessage<ChannelTopicDTO>();
      out.messageType = MessageTypes.CHANNEL_TOPIC;
      out.data = {
        channel: parsedMessage.target,
        topic: parsedMessage.message,
      };
      console.log('changing topic', out);
      return out;
    }

    if (parsedMessage.code === '315') {
      // End of who
      return;
    }

    if (parsedMessage.code === 'KICK') {
      const channel = parsedMessage.target;
      const banData = /#([^\s]+)\s([^:]+)\s/.exec(rawMessage);
      if (banData) {
        const out = new ProcessedMessage<KickedDTO>();
        out.messageType = MessageTypes.KICK;
        out.data = {
          channel,
          operator: parsedMessage.message,
          userTarget: banData[2],
          me: banData[2] === actualNick
        };
        return out;
      }
    }

    if (parsedMessage.code === 'PART') {
      // :Harko!~Harkolandia@harkonidaz.irc.tandilserver.com PART #SniferL4bs :"Leaving"
      let channel = parsedMessage.target;
      if (!channel) {
        channel = parsedMessage.message;
      }
      const user = parsedMessage.simplyOrigin;
      const message = parsedMessage.message;
      // user leaving (message)
      const out = new ProcessedMessage<UserLeavingDTO>();
      out.messageType = MessageTypes.USER_LEAVING;
      out.data = {
        channel,
        user,
        message,
        me: parsedMessage.simplyOrigin === actualNick
      };
      return out;
    }

    if (parsedMessage.code === 'QUIT') {
      const out = new ProcessedMessage<string>();
      out.messageType = MessageTypes.QUIT;
      out.data = parsedMessage.simplyOrigin;
      return out;
    }

    if (parsedMessage.code === 'JOIN') {
      // :Harko!~Harkolandia@harkonidaz.irc.tandilserver.com JOIN :#SniferL4bs
      // console.log('Join parser', parsedMessage);
      const channel = parsedMessage.message ? parsedMessage.message : parsedMessage.target;
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
          meAction: true,
          notifyAction: false
        };
      } else {
        out.data = {
          author: parsedMessage.simplyOrigin,
          message: parsedMessage.message,
          meAction: false,
          notifyAction: false
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
      out.data.mention = out.data.message ? out.data.message.indexOf(actualNick) >= 0 : false;
      return out;
    }

    // console.log('Uknown message: ', parsedMessage);
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
  // RC3: adding more info to IRC Plain parsed message:
  public tag?: string;
  public body?: string;
  public partials?: string[];
}

export class OriginData {
  public nick?: string;
  public identitity?: string;
  public server: string;
}

export class ProcessedMessage<dataType> {
  public messageType: MessageTypes;
  public data: dataType;

  public static getFrom(messages: IRCMessageDTO[], type: MessageTypes) {
    const out: ProcessedMessage<IRCMessageDTO>[] = [];
    if (!messages) {
      return [];
    }
    messages.forEach(msg => {
      const pm = new ProcessedMessage<IRCMessageDTO>();
      msg.fromLog = true;
      pm.data = msg;
      pm.messageType = type;
      out.push(pm);
    });
    return out;
  }
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
  NOTICE = 'NOTICE',
  MOTD = 'MOTD',
  CHANNEL_TOPIC = 'CHANNEL_TOPIC',
  QUIT = 'QUIT',
  MODE_CHANGE = 'MODE_CHANGE',
  KICK = 'KICK',
  BAN = 'BAN',
  BOUNCER = 'BOUNCER', // for server /PASS command connect.
  WHO_DATA = 'WHO_DATA',
  IM_BANNED = 'IM_BANNED',
  CLEAN_CHANNEL_LIST = 'CLEAN_CHANNEL_LIST',
  CHANNEL_LIST_APPEND = 'CHANNEL_LIST_APPEND'
}

export interface ChannelTopicDTO {
  channel: string;
  topic: string;
}

export interface ChannelListDTO {
  name: string;
  description: string;
}

export interface ChannelUsersDTO {
  channel: string;
  users: string[];
}

export interface ModeChangeDTO {
  target: string;
  channel: string;
  modeAdded: boolean;
  mode: string;
}

export interface NickChangedDTO {
  origin: string;
  newNick: string;
}

export interface KickedDTO {
  channel: string;
  operator: string;
  userTarget: string;
  me: boolean;
}

export interface UserLeavingDTO {
  channel: string;
  user: string;
  message: string;
  me?: boolean;
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
  richMessage?: MessageWithMetadata;
  meAction: boolean;
  notifyAction: boolean;
  specialAction?: boolean;
  isAwayNotify?: boolean;
  time?: string;
  date?: string;
  channel?: string;
  mention?: boolean;
  fromLog?: boolean;
  privateAuthor?: string; // when i send private message my nick is here.
}
