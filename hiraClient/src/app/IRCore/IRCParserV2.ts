import { Join } from './dto/Join';
import { PartHandler } from './handlers/Part.handler';
import { KickInfo } from './dto/KickInfo';
import { KickHandler } from './handlers/Kick.handler';
import { Away } from './dto/Away';
import { NewMode } from './dto/NewMode';
import { GmodeHandler } from './handlers/Gmode.handler';
import { Channel } from './dto/Channel';
import { ChannelListHandler } from './handlers/ChannelList.handler';
import { WhoIsHandler } from './handlers/Whois.handler';
import { WhoHandler } from './handlers/Who.handler';
import { Who } from './dto/Who';
import { UModes } from './utils/UModes.utils';
import { UsersHandler } from './handlers/Users.handler';
import { UserInChannel } from './dto/UserInChannel';
import { ListHandler } from './handlers/List.handler';
import { ChannelInfo } from './dto/ChannelInfo';
import { StatusHandler } from './handlers/Status.handler';
import { NickChange } from './dto/NickChange';
import { IRCMessage, OriginData } from './utils/IRCMessage.util';
import { ModeHandler } from './handlers/Mode.handler';
import { User } from './dto/User';
import { AwayHandler } from './handlers/Away.handler';
import { IgnoreHandler } from './handlers/Ignore.Handler';
import { MotdHandler } from './handlers/Motd.handler';
import { ChannelStatusHandler } from './handlers/ChannelStatus.handler';
import { Part } from './dto/Part';
import { QuitHandler } from './handlers/Quit.handler';
import { Quit } from './dto/Quit';
import { JoinHandler } from './handlers/Join.handler';

export class IRCParserV2 {

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

  public static processMessage(parsedMessage: IRCMessage, rawMessage: string, actualNick: string): void {

    if (parsedMessage.code === '319') { // lista de canales
      const chnlList = [];
      parsedMessage.message.split(' ').forEach(pmChnl => {
        const chnl = new Channel(pmChnl);
        chnlList.push(chnl);
      });
      ChannelListHandler.setChannelList(parsedMessage.partials[3], chnlList);
      return;
    }

    if (parsedMessage.code === '718') {
      // :avalon.hira.io 718 Tulkalex Tulkaz ~Harkito@net-j7j.cur.32.45.IP :is messaging you, and you have user mode +g set.
      // Use /ACCEPT +Tulkaz to allow.
      GmodeHandler.privateRequest(parsedMessage.partials[3]);
      return;
    }

    if (parsedMessage.code === '378') {
      // connecting from
      // :avalon.hira.io 378 Tulkalex Tulkalex :is connecting from ~Tulkalandi@167.99.172.78 167.99.172.78
      WhoIsHandler.addWhoisPartial(parsedMessage.partials[3], 'connectedFrom', parsedMessage.body.replace('is connecting from ', ''));
      return;
    }
    if (parsedMessage.code === '312') {
      // server desde donde está conectado
      // :avalon.hira.io 312 Tulkalex Tulkalex avalon.hira.io :Avalon - Frankfurt, Germany
      WhoIsHandler.addWhoisPartial(parsedMessage.partials[3], 'server', parsedMessage.body);
      return;
    }
    if (parsedMessage.code === '313') {
      // :avalon.hira.io 313 Tulkalex Tulkalex :is a GlobalOp on Hira
      WhoIsHandler.addWhoisPartial(parsedMessage.partials[3], 'isGOP', true);
      return;
    }
    if (parsedMessage.code === '379') {
      // :avalon.hira.io 379 Tulkalex Tulkalex :is using modes +Iiow
      const modes = parsedMessage.body.split(' ');
      WhoIsHandler.addWhoisPartial(parsedMessage.partials[3], 'modes', modes[modes.length - 1]);
      return;
    }
    if (parsedMessage.code === '330') {
      // :avalon.hira.io 330 Tulkalex Tulkalex alexander1712 :is logged in as
      WhoIsHandler.addWhoisPartial(parsedMessage.partials[3], 'userAccount', parsedMessage.partials[4]);
      return;
    }
    if (parsedMessage.code === '671') {
      // :avalon.hira.io 671 Tulkalex Tulkalex :is using a secure connection
      WhoIsHandler.addWhoisPartial(parsedMessage.partials[3], 'isSecured', true);
      return;
    }
    if (parsedMessage.code === '317') {
      // :avalon.hira.io 317 Tulkalex Tulkalex 6318 1602266231 :seconds idle, signon time
      WhoIsHandler.addWhoisPartial(parsedMessage.partials[3], 'idle', parsedMessage.partials[4]);
      WhoIsHandler.addWhoisPartial(parsedMessage.partials[3], 'lastLogin', parsedMessage.partials[5]);
      return;
    }

    if (parsedMessage.code === '318') {
      WhoIsHandler.finalWhoisMessage(parsedMessage.partials[3]);
      return;
    }

    if (parsedMessage.code === '352') { // user info (WHO response)
      const data = WhoHandler.WHOUserParser(rawMessage);
      if (data) {
        const whoData = new Who();
        whoData.serverFrom = data[7];
        whoData.nick = data[8];
        whoData.isAway = data[9] === 'G';
        whoData.isNetOp = data[10] === '*';
        whoData.rawMsg = rawMessage;
        const mod = data[11];
        if (mod === '~') {
          whoData.mode = UModes.FOUNDER;
        } else if (mod === '&') {
          whoData.mode = UModes.ADMIN;
        } else if (mod === '@') {
          whoData.mode = UModes.OPER;
        } else if (mod === '%') {
          whoData.mode = UModes.HALFOPER;
        } else if (mod === '+') {
          whoData.mode = UModes.VOICE;
        }
        WhoHandler.addWhoData(data[8], whoData);
      } else {
        console.error('BAD WHO RESPONSE PARSED: ', rawMessage, data);
      }
      return;
    }

    if (parsedMessage.code === '353') {
      const channel = UsersHandler.getChannelOfMessage(rawMessage);
      const users = parsedMessage.message.trim().split(' ');
      const usersInChannel: UserInChannel[] = [];
      users.forEach(user => {
        usersInChannel.push(new UserInChannel(user, channel));
      });
      UsersHandler.addUsersToChannel(channel, usersInChannel);
      return;
    }

    // 321 inicio lista de canales (borrar)
    if (parsedMessage.code === '321') {
      ListHandler.newChannelList();
      return;
    }

    // 322 canal de lista de canales
    if (parsedMessage.code === '322') {
      ListHandler.addChannels(new ChannelInfo(parsedMessage.partials[3], parsedMessage.body));
      return;
    }

    if (parsedMessage.code === '433') { // nick already in use
      // TODO: obtener nick anterior.
      console.log(parsedMessage);
      StatusHandler.onNickAlreadyInUse('');
      return;
    }

    if (parsedMessage.code === '474') {
      // TODO: obtener canal.
      console.log(parsedMessage);
      StatusHandler.onBanned('');
      return;
    }

    if (parsedMessage.code === 'NICK') {
      StatusHandler.onNickChanged(
        new NickChange(parsedMessage.simplyOrigin, parsedMessage.target ? parsedMessage.target : parsedMessage.message)
      );
      return;
    }

    if (parsedMessage.code === 'MODE') {
      const mode = ModeHandler.modeParser(rawMessage);
      const nmode = new NewMode();
      nmode.userTarget = new User(mode[3]);
      nmode.channelTarget = parsedMessage.target;
      nmode.modeAdded = mode[1] === '+';
      nmode.mode = mode[2];
      ModeHandler.changeMode(nmode);
      return;
    }

    if (parsedMessage.code === '301') { // away message
      const away = new Away();
      away.author = parsedMessage.partials[3];
      away.message = parsedMessage.message;
      AwayHandler.onAway(away);
      return;
    }

    if (parsedMessage.code === '716') { // server side ignored
      const ignore = new Away();
      ignore.author = parsedMessage.partials[3];
      ignore.message = parsedMessage.message;
      IgnoreHandler.onIgnore(ignore);
    }

    if (parsedMessage.code === '464') {
      MotdHandler.bouncerHookResponse.emit(parsedMessage);
      return;
    }

    if (parsedMessage.code === '375') {
      MotdHandler.motdResponse.emit(parsedMessage);
      return;
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
      const channels = ChannelStatusHandler.findChannels(rawMessage);
      ChannelStatusHandler.setChannelTopic(channels[0], parsedMessage.message);
      return;
    }

    if (parsedMessage.code === 'TOPIC') {
      ChannelStatusHandler.setChannelTopic(parsedMessage.target, parsedMessage.message);
      return;
    }

    if (parsedMessage.code === '315') {
      // TODO: check this... End of who
      return;
    }

    if (parsedMessage.code === 'KICK') {
      const channel = parsedMessage.target;
      const kickData = KickHandler.kickParse(rawMessage);
      const kickInfo = new KickInfo();
      kickInfo.channel = new Channel(channel);
      kickInfo.operator = parsedMessage.message;
      kickInfo.userTarget = new User(kickData[2]);
      KickHandler.onKick(kickInfo);
    }

    if (parsedMessage.code === 'PART') {
      // :Harko!~Harkolandia@harkonidaz.irc.tandilserver.com PART #SniferL4bs :"Leaving"
      let channel = parsedMessage.target;
      if (!channel) {
        channel = parsedMessage.message;
      }
      const part = new Part();
      part.channel = new Channel(channel);
      part.message = parsedMessage.message;
      part.user = new User(parsedMessage.simplyOrigin);
      PartHandler.onPart(part);
    }

    if (parsedMessage.code === 'QUIT') {
      QuitHandler.onQuit(new Quit(parsedMessage.simplyOrigin));
    }

    if (parsedMessage.code === 'JOIN') {
      const join = new Join();
      const channel = parsedMessage.message ? parsedMessage.message : parsedMessage.target;
      join.channel = new Channel(channel);
      join.user = new User(parsedMessage.simplyOrigin);
      join.origin = parsedMessage.origin;
      JoinHandler.onJoin(join);
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
/*






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
  CHANNEL_LIST_APPEND = 'CHANNEL_LIST_APPEND',
  WHOIS = 'WHOIS',
  GMODE = 'GMODE'
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
*/
