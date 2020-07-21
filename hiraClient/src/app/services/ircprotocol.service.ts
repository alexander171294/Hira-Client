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
      if (pMsg.messageType === MessageTypes.OUR_NICK_CHANGED) { // nuevo nick
        msgData.server.actualNick = pMsg.data as string;
      }
      if (pMsg.messageType === MessageTypes.NICK_ALREADY_IN_USE) { // nick en uso
        if (msgData.server.actualNick !== msgData.server.apodoSecundario) { // si no probamos el secundario
          this.changeNick(msgData.server.id, msgData.server.apodoSecundario);
        } else {
          // probamos uno random?

        }
      }
      this.msgPool.registerMessage(pMsg, msgData.server.id);
    });
  }

  changeNick(serverID: string, newNick: string) {
    const serverConnected = this.srvHdlr.getConnectionFromID(serverID);
    serverConnected.websocket.send('nick ' + newNick);
    serverConnected.actualNick = newNick;
  }

}

