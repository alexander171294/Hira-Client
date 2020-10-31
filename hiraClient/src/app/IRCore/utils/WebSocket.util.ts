import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';
import { EventEmitter } from '@angular/core';

export class WebSocketUtil {

  public static readonly messageReceived = new EventEmitter<MessageData>();
  public static readonly statusChanged = new EventEmitter<ConnectionStatusData<any>>();

  private wss: WebSocketSubject<string>;
  private readonly onOpenSubject = new Subject();
  private readonly onCloseSubject = new Subject();

  connect(url: string, uuid: string): Observable<string> {
      this.wss = webSocket<string>({
        url,
        serializer: msg => msg,
        deserializer: msg => msg.data,
        openObserver: this.onOpenSubject,
        closeObserver: this.onCloseSubject
      });
      const obs = this.wss.asObservable();
      obs.subscribe(msg => {
        WebSocketUtil.messageReceived.emit(new MessageData(uuid, msg));
      },
      err => {
        const status = new ConnectionStatusData<any>();
        status.status = ConnectionStatus.ERROR;
        status.data = {uuid, err};
        console.error('WS errror?', status.data);
        WebSocketUtil.statusChanged.emit(status);
      });
      this.onCloseSubject.subscribe(() => {
        const status = new ConnectionStatusData<string>();
        status.status = ConnectionStatus.DISCONNECTED;
        status.data = uuid;
        WebSocketUtil.statusChanged.emit(status);
      });
      this.onOpenSubject.subscribe(() => {
        const status = new ConnectionStatusData<string>();
        status.status = ConnectionStatus.CONNECTED;
        status.data = uuid;
        WebSocketUtil.statusChanged.emit(status);
      });
      return obs;
  }

  public send(msg: string) {
      this.wss.next(msg);
  }

  public disconnect() {
    this.wss.complete();
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

export class MessageData {
  uuid: string;
  message: string;
  constructor(uuid: string, message: string) {
    this.uuid = uuid;
    this.message = message;
  }
}
