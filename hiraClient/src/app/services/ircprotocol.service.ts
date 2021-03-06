import { Injectable } from '@angular/core';
import { ServerData, ConnectionMethods } from '../utils/ServerData';
import { MessageHandlerService, MessageData, ErrorData } from './message-handler.service';
import { IRCParser, MessageTypes, ProcessedMessage, IRCMessageDTO, IRCMessage, NickChangedDTO } from '../utils/IRCParser';
import { ServersHdlrService, ServerDataConnected } from './servers-hdlr.service';
import { MessagePoolService } from './message-pool.service';
import { ChannellistsService } from './channellists.service';

declare var stopEff;

@Injectable({
  providedIn: 'root'
})
export class IRCProtocolService {

  constructor(private msgHdlr: MessageHandlerService,
              private srvHdlr: ServersHdlrService,
              private msgPool: MessagePoolService,
              private chlList: ChannellistsService) {
    this.msgHdlr.onError.subscribe((err: ErrorData) => {
      console.error('IRCProtocolService:: error detected -> ', err);
      msgPool.clear(err.server.id);
    });
    this.msgHdlr.onMessage.subscribe(msgData => this.onMessage(msgData) );
  }

  public connect(server: ServerData) {
    this.msgHdlr.connect(server);
    this.sendInitialMessages(server.id);
  }

  public disconnect(server: ServerDataConnected) {
    server.websocket.disconnect();
  }

  private onMessage(msgData: MessageData) {
    // AutoPong
    if (msgData.message.indexOf('PING') === 0) {
      const pingResp = msgData.message.slice(5);
      msgData.server.websocket.send('PONG ' + pingResp);
      return;
    }
    // EXITED BY ERROR
    if (msgData.message.indexOf('ERROR') === 0) {
      this.disconnect(msgData.server);
      window.location.reload();
      return;
    }

    IRCParser.parseMessage(msgData.message).forEach(parsedMessage => {
      const pMsg = IRCParser.processMessage(parsedMessage, msgData.message, msgData.server.actualNick);
      if (!pMsg) {
        return;
      }
      if (pMsg.messageType === MessageTypes.WHOIS) {
        this.chlList.whoisData(pMsg.data as string);
        return;
      }
      if (pMsg.messageType === MessageTypes.GMODE) {
        this.chlList.gmode(pMsg.data as string);
        return;
      }
      if (pMsg.messageType === MessageTypes.CLEAN_CHANNEL_LIST) {
        this.chlList.clearChannel();
        return;
      }
      if (pMsg.messageType === MessageTypes.CHANNEL_LIST_APPEND) {
        this.chlList.addChannel(pMsg.data as any);
        return;
      }
      // Sección reactiva (poner aquí las respuestas automatizadas a ciertos cambios) //
      if (pMsg.messageType === MessageTypes.OUR_NICK_CHANGED) { // nuevo nick
        msgData.server.actualNick = (pMsg.data as NickChangedDTO).newNick as string;
      }
      if (pMsg.messageType === MessageTypes.NICK_ALREADY_IN_USE) { // nick en uso
        if (msgData.server.actualNick !== msgData.server.apodoSecundario) { // si no probamos el secundario
          this.changeNick(msgData.server.id, msgData.server.apodoSecundario);
        } else {
          // TODO: probamos uno random?
        }
      }
      if (pMsg.messageType === MessageTypes.MOTD && this.srvHdlr.servers[msgData.server.id].autoConnect === ConnectionMethods.LP) {
        this.sendIdentify(msgData.server.id, this.srvHdlr.servers[msgData.server.id].password);
      }
      if (pMsg.messageType === MessageTypes.BOUNCER && this.srvHdlr.servers[msgData.server.id].autoConnect === ConnectionMethods.PASS) {
        const serverData = this.srvHdlr.servers[msgData.server.id];
        this.sendServerPass(msgData.server.id, serverData.username, serverData.apodo, serverData.password);
      }
      // fin de la sección reactiva //
      this.msgPool.registerMessage(pMsg, msgData.server.id);
    });
  }

  public changeNick(serverID: string, newNick: string) {
    const serverConnected = this.srvHdlr.getConnectionFromID(serverID);
    serverConnected.websocket.send('nick ' + newNick);
    serverConnected.actualNick = newNick;
  }

  public sendIdentify(serverID: string, password: string) {
    const serverConnected = this.srvHdlr.getConnectionFromID(serverID);
    serverConnected.websocket.send('PRIVMSG nickserv identify ' + password);
  }

  public sendServerPass(serverID: string, user: string, apodo: string, password: string) {
    const serverConnected = this.srvHdlr.getConnectionFromID(serverID);
    serverConnected.websocket.send('PASS ' + user + ':' + password);
    serverConnected.websocket.send('nick ' + apodo);
  }

  public sendInitialMessages(serverID: string) {
    const serverConnected = this.srvHdlr.getConnectionFromID(serverID);
    serverConnected.websocket.send('ENCODING UTF-8');
    if (!serverConnected.isWS) {
      serverConnected.websocket.send('HOST ' + serverConnected.server);
    }
    serverConnected.websocket.send('user ' + serverConnected.username + ' * * :HiraClient');
    serverConnected.websocket.send('nick ' + serverConnected.apodo);
    serverConnected.actualNick = serverConnected.apodo;
  }

  public autoJoin(serverID: string) {
    const serverConnected = this.srvHdlr.getConnectionFromID(serverID);
    serverConnected.autojoin.split(',').forEach(channel => {
      serverConnected.websocket.send('JOIN ' + channel.trim());
    });
  }

  public join(serverID: string, channel: string) {
    const serverConnected = this.srvHdlr.getConnectionFromID(serverID);
    serverConnected.websocket.send('JOIN ' + channel.trim());
  }

  public sendMessageOrCommand(serverID: string, command: string, target?: string) {
    const serverConnected = this.srvHdlr.getConnectionFromID(serverID);
    if (command[0] === '/') {
      let cmd = command.slice(1);
      const verb = cmd.split(' ')[0].toLowerCase();
      if (verb === 'query') {
        cmd = cmd.slice(5).trim();
        // TODO: query a cmd
      }
      if (verb === 'join') {
        // enviar cmd esto es un join
        serverConnected.websocket.send(cmd);
        return;
      }
      if (verb === 'umode') {
        // enviar cmd esto es un join
        cmd = cmd.replace('umode', 'mode ' + serverConnected.actualNick);
      }
      if (verb === 'stop') {
        // enviar cmd esto es un join
        stopEff();
        return;
      }
      if (verb === 'me') {
        cmd = cmd.slice(2).trim();
        serverConnected.websocket.send('PRIVMSG ' + target + ' :' + String.fromCharCode(1) + 'ACTION ' + cmd + String.fromCharCode(1));
        this.registerMessage(target, serverConnected, cmd, serverID, true);
        return;
      }
      if (verb === 'cs') {
        // chanserv?
        cmd = cmd.replace('cs', 'PRIVMSG ChanServ :');
      }
      if (verb === 'hc') {
        // chanserv?
        cmd = cmd.replace('hc', 'PRIVMSG HiraClient :');
      }
      if (verb === 'ns') {
        // nickserv?
        cmd = cmd.replace('ns', 'PRIVMSG NickServ :');
      }
      if (verb === 'msg') {
        cmd = cmd.replace('msg', 'PRIVMSG');
      }
      if (verb === 'leave') {
        cmd = cmd.replace('leave', 'PART');
      }
      if (verb === 'away') {
        if (cmd.length === 4) {
          const now = new Date();
          cmd += ' AFK desde ' + now.getDay() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear() + ' ' +
                  now.getHours() + ':' + now.getMinutes();
        }
      }
      if (verb === 'back') {
        cmd = cmd.replace('back', 'away');
      }
      serverConnected.websocket.send(cmd);
    } else {
      serverConnected.websocket.send('PRIVMSG ' + target + ' :' + command);
      this.registerMessage(target, serverConnected, command, serverID, false);
    }
  }

  private registerMessage(target: string, serverConnected: ServerDataConnected, command: string, serverID: string, meAction: boolean) {
    const message = new ProcessedMessage<IRCMessageDTO>();
    if (target[0] === '#') {
      message.messageType = MessageTypes.CHANNEL_MSG;
      message.data = {
        author: serverConnected.actualNick,
        message: command,
        meAction,
        notifyAction: false,
        channel: target,
        date: IRCParser.getDateStr(),
        time: IRCParser.getTime()
      };
    } else {
      message.messageType = MessageTypes.PRIV_MSG;
      message.data = {
        author: target,
        message: command,
        meAction,
        notifyAction: false,
        privateAuthor: serverConnected.actualNick,
        date: IRCParser.getDateStr(),
        time: IRCParser.getTime()
      };
    }
    this.msgPool.registerMessage(message, serverID);
  }

}

