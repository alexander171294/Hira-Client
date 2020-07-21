import { Injectable } from '@angular/core';
import { ServerData } from './ServerData';
import { MessageHandlerService, MessageData } from './message-handler.service';
import { IRCParser, MessageTypes } from './IRCParser';
import { ServersHdlrService } from './servers-hdlr.service';
import { MessagePoolService } from './message-pool.service';

@Injectable({
  providedIn: 'root'
})
export class IRCProtocolService {

  constructor(private msgHdlr: MessageHandlerService,
              private srvHdlr: ServersHdlrService,
              private msgPool: MessagePoolService) {
    this.msgHdlr.onError.subscribe(err => {
      console.log('IRCProtocolService:: error detected -> ', err);
    });
    this.msgHdlr.onMessage.subscribe(msgData => this.onMessage(msgData) );
  }

  public connect(server: ServerData) {
    this.msgHdlr.connect(server);
    this.sendInitialMessages(server.id);
  }

  private onMessage(msgData: MessageData) {

    console.log('IRCProtocolService:: Message -> ', msgData);

    // AutoPong
    if (msgData.message.indexOf('PING') === 0) {
      const pingResp = msgData.message.slice(5);
      msgData.server.websocket.send('PONG ' + pingResp);
      return;
    }

    IRCParser.parseMessage(msgData.message).forEach(parsedMessage => {
      const pMsg = IRCParser.processMessage(parsedMessage, msgData.message, msgData.server.actualNick);
      // Sección reactiva (poner aquí las respuestas automatizadas a ciertos cambios) //
      if (pMsg.messageType === MessageTypes.OUR_NICK_CHANGED) { // nuevo nick
        msgData.server.actualNick = pMsg.data as string;
      }
      if (pMsg.messageType === MessageTypes.NICK_ALREADY_IN_USE) { // nick en uso
        if (msgData.server.actualNick !== msgData.server.apodoSecundario) { // si no probamos el secundario
          this.changeNick(msgData.server.id, msgData.server.apodoSecundario);
        } else {
          // TODO: probamos uno random?
        }
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

  public sendInitialMessages(serverID: string) {
    const serverConnected = this.srvHdlr.getConnectionFromID(serverID);
    serverConnected.websocket.send('ENCODING UTF-8');
    serverConnected.websocket.send('HOST ' + serverConnected.server);
    serverConnected.websocket.send('user ' + serverConnected.username + ' * * :HiraClient');
    serverConnected.websocket.send('nick ' + serverConnected.apodo);
    serverConnected.actualNick = serverConnected.apodo;
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
      if (verb === 'me') {
        cmd = cmd.slice(2).trim();
        serverConnected.websocket.send('PRIVMSG ' + target + ' :' + String.fromCharCode(1) + 'ACTION ' + cmd + String.fromCharCode(1));
        return;
      }
      if (verb === 'cs') {
        // chanserv?
      }
      if (verb === 'ns') {
        // nickserv?
      }
      serverConnected.websocket.send(cmd);
    } else {
      serverConnected.websocket.send('PRIVMSG ' + target + ' :' + command);
    }
  }

}

