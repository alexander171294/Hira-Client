import { IRCMessage } from './../utils/IRCMessage.util';
import { ServerHandler } from './../handlers/Server.handler';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServerMsgService {

  public readonly messages: IRCMessage[] = [];

  constructor() {
    ServerHandler.serverResponse.subscribe((d: IRCMessage) => {
      this.messages.push(d);
    })
    ServerHandler.serverNoticeResponse.subscribe((d: IRCMessage) => {
      this.messages.push(d);
    });
  }


}
