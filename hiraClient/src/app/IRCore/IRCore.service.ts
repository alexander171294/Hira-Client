import { WebSocketUtil } from './utils/WebSocket.util';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IRCoreService {

  public static readonly statusChanged = new EventEmitter<ConnectionStatusData<any>>();
  public static readonly messageReceived = new EventEmitter<string>();

  private webSocket: WebSocketUtil;

  constructor() { }

  public connect(url: string, uuid?: string): string {
    this.webSocket = new WebSocketUtil();
    this.webSocket.onCloseSubject.subscribe(() => {
      const status = new ConnectionStatusData<string>();
      status.status = ConnectionStatus.DISCONNECTED;
      status.data = uuid;
      IRCoreService.statusChanged.emit(status);
    });
    this.webSocket.onOpenSubject.subscribe(() => {
      const status = new ConnectionStatusData<string>();
      status.status = ConnectionStatus.CONNECTED;
      status.data = uuid;
      IRCoreService.statusChanged.emit(status);
    });
    this.webSocket.connect(url).subscribe(msg => {
      IRCoreService.messageReceived.emit(msg);
    },
    err => {
      const status = new ConnectionStatusData<any>();
      status.status = ConnectionStatus.ERROR;
      status.data = {uuid, err};
      console.error('WS errror?', status.data);
      IRCoreService.statusChanged.emit(status);
    });
    return uuid;
  }

  public disconnect(): void {
    this.webSocket.disconnect();
  }
}

export class ConnectionStatusData<t> {
  status: ConnectionStatus;
  data: t;
}

export enum ConnectionStatus {
  CONNECTED,
  DISCONNECTED,
  ERROR
}
