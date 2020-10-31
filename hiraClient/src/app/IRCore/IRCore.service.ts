import { MessageData, WebSocketUtil } from './utils/WebSocket.util';
import { Injectable } from '@angular/core';
import { IRCParserV2 } from './IRCParserV2';

@Injectable({
  providedIn: 'root'
})
export class IRCoreService {

  private webSocket: WebSocketUtil;

  constructor() {
    WebSocketUtil.messageReceived.subscribe((message: MessageData) => {
      IRCParserV2.parseMessage(message.message);
    });
  }

  public connect(url: string) {
    this.webSocket = new WebSocketUtil();
    this.webSocket.connect(url, 'WSocket');
  }

  public disconnect(): void {
    this.webSocket.disconnect();
  }

  public send(rawMessage: string) {
    this.webSocket.send(rawMessage);
  }
}
